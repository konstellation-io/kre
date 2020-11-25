Feature: Runtime Version Management
  As an API Client
  I want to manage runtime versions

  Scenario: Version publishing
    Given the API client has already logged in
    And the version "5fbd2724f6f308a6b8c5ad90" status is "STARTED"
    When the API client publish the version "5fbd2724f6f308a6b8c5ad90" sending "publish integration test" comment
    Then the version "5fbd2724f6f308a6b8c5ad90" status is "PUBLISHED"

  Scenario: Version unpublishing
    Given the API client has already logged in
    And the version "5fbd2724f6f308a6b8c5ad90" status is "PUBLISHED"
    When the API client unpublish the version "5fbd2724f6f308a6b8c5ad90" sending "unpublish integration test" comment
    Then the version "5fbd2724f6f308a6b8c5ad90" status is "STARTED"

  Scenario: Request to an entrypoint
    Given the API client has already logged in
    And the version "5fbd2724f6f308a6b8c5ad90" status is "PUBLISHED"
    When the API client calls to the workflow WorkflowTest at "entrypoint.kre-int-tests.kre-int.konstellation.io:443"
    Then the workflow response contains a property "go_runner_success" equal to "true"
    Then the workflow response contains a property "py_runner_success" equal to "true"
