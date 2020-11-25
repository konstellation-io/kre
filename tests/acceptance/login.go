package integrationtests

func (r *TestRunner) theAPIClientHasAlreadyLoggedIn() error {
	return r.gqManager.SignIn()
}
