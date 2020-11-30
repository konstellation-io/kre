Feature: Settings
  As an API Client
  I want to manage the KRE settings

  Scenario: General settings management successfully
    Given the API client has already logged in
    When the API client increases the session lifetime in one day
    Then the API client will receive the session lifetime setting increased
