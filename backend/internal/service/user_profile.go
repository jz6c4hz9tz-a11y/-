package service

import (
	"fmt"
	"net/url"
	"strings"
	"time"

	"infinite-canvas/backend/internal/model"
)

type UserProfileSummary struct {
	UserID           string `json:"userId"`
	Username         string `json:"username"`
	Email            string `json:"email"`
	DisplayName      string `json:"displayName"`
	AvatarURL        string `json:"avatarUrl"`
	IdentityProvider string `json:"identityProvider"`
	AccountType      string `json:"accountType"`
	Balance          string `json:"balance"`
}

type UpdateUserProfileRequest struct {
	DisplayName *string `json:"displayName"`
	AccountType *string `json:"accountType"`
	AvatarURL   *string `json:"avatarUrl"`
}

func (s *Service) UpdateUserProfile(userID string, req UpdateUserProfileRequest) (*UserProfileSummary, error) {
	user, err := s.repo.User(userID)
	if err != nil {
		return nil, err
	}
	now := time.Now()
	changed := false
	if req.DisplayName != nil {
		displayName := normalizeDisplayName(*req.DisplayName, user.Username)
		if displayName != user.DisplayName {
			user.DisplayName = displayName
			changed = true
		}
	}
	if req.AccountType != nil {
		accountType := strings.TrimSpace(*req.AccountType)
		if accountType != "" && accountType != "personal" && accountType != "team" {
			return nil, BadAuthRequest("账号类型仅支持 personal 或 team")
		}
		if accountType != "" && accountType != user.AccountType {
			user.AccountType = accountType
			changed = true
		}
	}
	if changed {
		user.UpdatedAt = now
		if err := s.repo.Save(user); err != nil {
			return nil, err
		}
	}
	if req.AvatarURL != nil {
		avatarURL := strings.TrimSpace(*req.AvatarURL)
		if avatarURL == "" {
			if err := s.repo.DeleteLocalIdentity(userID); err != nil {
				return nil, err
			}
		} else {
			if !validAvatarURL(avatarURL) {
				return nil, BadAuthRequest("头像地址必须是本站资源或 HTTPS 图片地址")
			}
			identity := &model.UserIdentity{
				ID:               newID(),
				UserID:           userID,
				Provider:         "local",
				Subject:          userID,
				ProviderUsername: userID,
				AvatarURL:        avatarURL,
			}
			if err := s.repo.UpsertLocalIdentity(identity); err != nil {
				return nil, err
			}
		}
	}
	return s.UserProfile(userID)
}

func validAvatarURL(value string) bool {
	if strings.HasPrefix(value, "/api/resources/") || strings.HasPrefix(value, "resource:") {
		return true
	}
	parsed, err := url.Parse(value)
	if err != nil {
		return false
	}
	return parsed.Scheme == "http" || parsed.Scheme == "https"
}

func (s *Service) UserProfile(userID string) (*UserProfileSummary, error) {
	user, err := s.repo.User(userID)
	if err != nil {
		return nil, err
	}
	now := time.Now()
	changed := false
	if user.AccountType != "personal" && user.AccountType != "team" {
		user.AccountType = "personal"
		changed = true
	}
	if changed {
		user.UpdatedAt = now
		if err := s.repo.Save(user); err != nil {
			return nil, err
		}
	}

	publicUser, err := s.PublicAuthUser(user)
	if err != nil {
		return nil, err
	}
	return &UserProfileSummary{
		UserID:           user.ID,
		Username:         user.Username,
		Email:            user.Email,
		DisplayName:      user.DisplayName,
		AvatarURL:        publicUser.AvatarURL,
		IdentityProvider: publicUser.IdentityProvider,
		AccountType:      user.AccountType,
		Balance:          formatBalance(user.BalanceCents),
	}, nil
}

func formatBalance(cents int64) string {
	sign := ""
	if cents < 0 {
		sign = "-"
		cents = -cents
	}
	return fmt.Sprintf("%s%d.%02d", sign, cents/100, cents%100)
}
