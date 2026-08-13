package service

import (
	"strings"
	"testing"

	"infinite-canvas/backend/internal/model"
	"infinite-canvas/backend/internal/repository"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestNormalizeTaskInputNormalizesTypedProviderConfig(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&model.SystemSetting{}, &model.ChannelModel{}); err != nil {
		t.Fatal(err)
	}
	if _, err := normalizeTaskInput(map[string]any{
		"mode":   "text",
		"config": providerConfig{ChannelID: "channel-1", Model: "text-model", APIKey: "system"},
	}); err != nil {
		t.Fatal(err)
	}
}

func TestNormalizeTaskInputStillAllowsSecretProtection(t *testing.T) {
	input, err := normalizeTaskInput(map[string]any{
		"config": providerConfig{BaseURL: "https://example.com", APIKey: "private-key", Model: "text-model"},
	})
	if err != nil {
		t.Fatal(err)
	}
	config, ok := input["config"].(map[string]any)
	if !ok || config["apiKey"] != "private-key" {
		t.Fatalf("normalized config = %#v", input["config"])
	}
	svc := &Service{dataDir: t.TempDir()}
	if err := svc.protectTaskSecrets(input); err != nil {
		t.Fatal(err)
	}
	protected, _ := config["apiKey"].(string)
	if protected == "private-key" || !strings.HasPrefix(protected, encryptedSettingPrefix) {
		t.Fatalf("protected apiKey = %q", protected)
	}
}

func TestTaskInputRejectsInlineMedia(t *testing.T) {
	input, err := normalizeTaskInput(map[string]any{
		"referenceImages": []providerMedia{{DataURL: testReferenceImageDataURL}},
	})
	if err != nil {
		t.Fatal(err)
	}
	if !containsInlineMediaDataURL(input) {
		t.Fatal("containsInlineMediaDataURL() = false")
	}
}

func TestCreateSessionRemovesDraftWhenTaskCreationFails(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&model.SystemSetting{}, &model.Asset{}, &model.CanvasProject{}, &model.Session{}, &model.Message{}, &model.Task{}, &model.TaskLog{}, &model.Result{}, &model.ApiCallLog{}); err != nil {
		t.Fatal(err)
	}
	for range 5 {
		if err := db.Create(&model.Task{ID: newID(), UserID: "user-1", Status: model.TaskStatusQueued, Prompt: "queued"}).Error; err != nil {
			t.Fatal(err)
		}
	}
	svc := &Service{repo: repository.New(db), dataDir: t.TempDir()}
	if _, err := svc.CreateSession("user-1", CreateSessionRequest{Prompt: "new session"}); err == nil {
		t.Fatal("CreateSession() error = nil")
	}
	var sessionCount int64
	var messageCount int64
	if err := db.Model(&model.Session{}).Where("user_id = ?", "user-1").Count(&sessionCount).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Model(&model.Message{}).Where("user_id = ?", "user-1").Count(&messageCount).Error; err != nil {
		t.Fatal(err)
	}
	if sessionCount != 0 || messageCount != 0 {
		t.Fatalf("draft counts = sessions:%d messages:%d", sessionCount, messageCount)
	}
}
