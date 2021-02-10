Feature: Runtime Version Management
  As an API Client
  I want to manage runtime versions

  Scenario: Version publishing
    Given the API client has already logged in
    And the version "runtime-test-v1" status is "STARTED"
    When the API client publish the version "runtime-test-v1" sending "publish integration test" comment
    Then the version "runtime-test-v1" status is "PUBLISHED"

  Scenario: Version unpublishing
    Given the API client has already logged in
    And the version "runtime-test-v1" status is "PUBLISHED"
    When the API client unpublish the version "runtime-test-v1" sending "unpublish integration test" comment
    Then the version "runtime-test-v1" status is "STARTED"

  Scenario: Request to an entrypoint
    Given the API client has already logged in
    And the version "runtime-test-v1" status is "PUBLISHED"
    When the API client calls to the workflow WorkflowTest at "entrypoint.kre-int.konstellation.io:443"
    Then the workflow response contains a property "go_runner_success" equal to "true"
    Then the workflow response contains a property "py_runner_success" equal to "true"
