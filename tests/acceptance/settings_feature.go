package integrationtests

import (
	"fmt"

	"github.com/cucumber/godog"
)

const increasedSessionLifetimeKey = "increasedSessionLifetime"

func (r *TestRunner) theAPIClientIncreasesTheSessionLifetimeInOneDay() error {
	currentValue, err := r.gqManager.SessionLifetime()
	if err != nil {
		return err
	}

	newValue := currentValue + 1

	updatedSessionLifetime, err := r.gqManager.UpdateSessionLifetime(newValue)
	if err != nil {
		return err
	}

	r.State[increasedSessionLifetimeKey] = updatedSessionLifetime

	return nil
}

func (r *TestRunner) theAPIClientWillReceiveTheSessionLifetimeSettingIncreased() error {
	currentValue, err := r.gqManager.SessionLifetime()
	if err != nil {
		return err
	}

	expectedValue := r.State[increasedSessionLifetimeKey]
	if expectedValue != currentValue {
		// nolint:goerr113
		return fmt.Errorf("the current value of SessionLifetimeInDays is %d and should be %d", currentValue, expectedValue)
	}

	return nil
}

func (r *TestRunner) InitSettingsScenarios(ctx *godog.ScenarioContext) {
	ctx.Step(`^the API client has already logged in$`, r.theAPIClientHasAlreadyLoggedIn)

	ctx.Step(`^the API client increases the session lifetime in one day$`,
		r.theAPIClientIncreasesTheSessionLifetimeInOneDay)

	ctx.Step(`^the API client will receive the session lifetime setting increased$`,
		r.theAPIClientWillReceiveTheSessionLifetimeSettingIncreased)
}
