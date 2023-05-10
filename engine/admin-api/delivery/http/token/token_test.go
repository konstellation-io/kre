package token_test

import (
	"testing"

	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/token"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var tokenKey = []byte("")

func newTokenWithProductRoles(userRoles *token.UserRoles) (string, error) {
	if userRoles == nil {
		return jwt.NewWithClaims(jwt.SigningMethodHS256, nil).SignedString(tokenKey)
	}

	claims := token.CustomClaims{
		ProductRoles: userRoles.ProductRoles,
		RealmAccess:  userRoles.RealmAccess,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject: userRoles.UserId,
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(tokenKey)
}

func Test_CustomClaims(t *testing.T) {
	expectedUserRoles := &token.UserRoles{
		UserId: "test-user",
		ProductRoles: token.ProductRoles{
			"test-product": {
				"ADMIN",
			},
		},
		RealmAccess: token.RealmAccess{
			Roles: []string{"VIEWER"},
		},
	}

	accessToken, err := newTokenWithProductRoles(expectedUserRoles)
	require.NoError(t, err)

	tokenParser := token.NewParser()

	userRoles, err := tokenParser.GetUserRoles(accessToken)
	require.NoError(t, err)
	assert.Equal(t, expectedUserRoles, userRoles)
}

func Test_CustomClaims_FailsIfTokenIsNotValid(t *testing.T) {
	accessToken := "this-is-an-invalid-token"

	tokenParser := token.NewParser()

	productRoles, err := tokenParser.GetUserRoles(accessToken)
	assert.ErrorIs(t, err, jwt.ErrTokenMalformed)
	assert.Nil(t, productRoles)
}

func Test_CustomClaims_ReturnNilIfNoAccessClaims(t *testing.T) {
	accessToken, err := newTokenWithProductRoles(nil)
	require.NoError(t, err)

	tokenParser := token.NewParser()

	_, err = tokenParser.GetUserRoles(accessToken)
	assert.NoError(t, err)
}
