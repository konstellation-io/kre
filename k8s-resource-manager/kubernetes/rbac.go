package kubernetes

import (
	"github.com/ghodss/yaml"
	"io/ioutil"
	apiv1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	"log"
)

func (k *ResourceManager) createRBAC(ns string) error {
	log.Printf("Creating RBAC: %v", ns)

	err := k.createRole(ns)
	if err != nil {
		log.Printf("error creating role: %v", err)
		return err
	}

	err = k.createServiceAccount(ns)
	if err != nil {
		log.Printf("error creating service account: %v", err)
		return err
	}

	err = k.createRoleBinding(ns)
	if err != nil {
		log.Printf("error creating role binding: %v", err)
		return err
	}

	return nil
}

func (k *ResourceManager) createRole(ns string) error {
	bytes, err := ioutil.ReadFile("assets/role.yaml")

	var role *rbacv1.Role
	err = yaml.Unmarshal(bytes, &role)
	if err != nil {
		return err
	}

	_, err = k.clientset.RbacV1().Roles(ns).Create(role)

	return err
}

func (k *ResourceManager) createRoleBinding(ns string) error {
	bytes, err := ioutil.ReadFile("assets/role_binding.yaml")

	var roleBinding *rbacv1.RoleBinding
	err = yaml.Unmarshal(bytes, &roleBinding)
	if err != nil {
		return err
	}

	_, err = k.clientset.RbacV1().RoleBindings(ns).Create(roleBinding)

	return err
}

func (k *ResourceManager) createServiceAccount(ns string) error {
	bytes, err := ioutil.ReadFile("assets/service_account.yaml")
	if err != nil {
		return err
	}

	var serviceAccount *apiv1.ServiceAccount
	err = yaml.Unmarshal(bytes, &serviceAccount)
	if err != nil {
		return err
	}

	_, err = k.clientset.CoreV1().ServiceAccounts(ns).Create(serviceAccount)

	return err
}
