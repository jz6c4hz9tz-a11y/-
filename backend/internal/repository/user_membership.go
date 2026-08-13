package repository

import (
	"infinite-canvas/backend/internal/model"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (r *Repository) UserMembership(userID string) (*model.UserMembership, error) {
	var membership model.UserMembership
	if err := r.db.First(&membership, "user_id = ?", userID).Error; err != nil {
		return nil, err
	}
	return &membership, nil
}

// CreateUserMembership 只写入不覆盖，避免重复调用把已有会员状态重置为未开通。
func (r *Repository) CreateUserMembership(membership *model.UserMembership) error {
	return r.db.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "user_id"}}, DoNothing: true}).Create(membership).Error
}

func (r *Repository) UpdateUserMembershipStatus(userID string, status bool) error {
	return r.db.Model(&model.UserMembership{}).Where("user_id = ?", userID).Updates(map[string]any{
		"status":     status,
		"updated_at": gorm.Expr("CURRENT_TIMESTAMP"),
	}).Error
}
