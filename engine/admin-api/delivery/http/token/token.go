package token

import (
	"github.com/golang-jwt/jwt/v5"
)

type UserRoles struct {
	ID           string
	RealmAccess  RealmAccess
	ProductRoles ProductRoles
}

type ProductRoles map[string][]string

type RealmAccess struct {
	Roles []string `json:"roles"`
}

type CustomClaims struct {
	ProductRoles ProductRoles `json:"product_roles"`
	RealmAccess  RealmAccess  `json:"realm_access"`
	jwt.RegisteredClaims
}
