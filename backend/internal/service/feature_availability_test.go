package service

import (
	"errors"
	"testing"

	"infinite-canvas/backend/internal/model"
	"infinite-canvas/backend/internal/repository"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestFeatureAvailabilityDefaultsToEnabled(t *testing.T) {
	svc, _ := newFeatureAvailabilityTestService(t)

	setting, err := svc.FeatureAvailability()
	if err != nil {
		t.Fatal(err)
	}
	if setting.Configured || !setting.ShortDramaEnabled || !setting.TaskCenterEnabled {
		t.Fatalf("FeatureAvailability() = %#v", setting)
	}
}

func TestUpdateFeatureAvailabilityPersistsAndAudits(t *testing.T) {
	svc, db := newFeatureAvailabilityTestService(t)
	actor := &model.User{ID: "admin-1", Role: model.UserRoleAdmin}
	want := FeatureAvailability{ShortDramaEnabled: false, TaskCenterEnabled: true}

	setting, err := svc.UpdateFeatureAvailability(actor, want)
	if err != nil {
		t.Fatal(err)
	}
	if !setting.Configured || setting.ShortDramaEnabled || !setting.TaskCenterEnabled {
		t.Fatalf("UpdateFeatureAvailability() = %#v", setting)
	}
	if err := svc.RequireFeature(FeatureShortDrama); err == nil {
		t.Fatal("RequireFeature(shortDrama) error = nil")
	} else {
		var authErr *AuthError
		if !errors.As(err, &authErr) || authErr.Status != 403 {
			t.Fatalf("RequireFeature(shortDrama) error = %#v", err)
		}
	}
	var auditCount int64
	if err := db.Model(&model.AdminAuditEvent{}).Where("action = ?", "feature_availability.update").Count(&auditCount).Error; err != nil {
		t.Fatal(err)
	}
	if auditCount != 1 {
		t.Fatalf("audit count = %d, want 1", auditCount)
	}
}

func newFeatureAvailabilityTestService(t *testing.T) (*Service, *gorm.DB) {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if sqlDB, err := db.DB(); err == nil {
		sqlDB.SetMaxOpenConns(1)
	}
	if err := db.AutoMigrate(&model.SystemSetting{}, &model.AdminAuditEvent{}); err != nil {
		t.Fatal(err)
	}
	return New(repository.New(db), t.TempDir()), db
}
