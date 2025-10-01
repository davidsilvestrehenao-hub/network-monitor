/**
 * GraphQL Schema
 *
 * Defines the GraphQL API schema.
 * All business logic is delegated to services from the DI container.
 */

export const schema = `
  # ============================================
  # Domain Types
  # ============================================
  
  type Target {
    id: ID!
    name: String!
    address: String!
    ownerId: String!
    speedTestResults: [SpeedTestResult!]!
    alertRules: [AlertRule!]!
  }

  type SpeedTestResult {
    id: Int!
    ping: Float
    download: Float
    status: String!
    error: String
    createdAt: String!
    targetId: String!
  }

  type AlertRule {
    id: Int!
    name: String!
    targetId: String!
    metric: String!
    condition: String!
    threshold: Float!
    enabled: Boolean!
  }

  type IncidentEvent {
    id: Int!
    timestamp: String!
    type: String!
    description: String!
    resolved: Boolean!
    targetId: String!
    ruleId: Int
  }

  type Notification {
    id: Int!
    message: String!
    sentAt: String!
    read: Boolean!
    userId: String!
  }

  type PushSubscription {
    id: ID!
    endpoint: String!
    p256dh: String!
    auth: String!
    userId: String!
  }

  type User {
    id: ID!
    name: String
    email: String
    image: String
  }

  # ============================================
  # Input Types
  # ============================================

  input CreateTargetInput {
    name: String!
    address: String!
  }

  input UpdateTargetInput {
    name: String
    address: String
  }

  input CreateAlertRuleInput {
    name: String!
    targetId: String!
    metric: String!
    condition: String!
    threshold: Float!
    enabled: Boolean
  }

  input UpdateAlertRuleInput {
    name: String
    metric: String
    condition: String
    threshold: Float
    enabled: Boolean
  }

  input CreatePushSubscriptionInput {
    endpoint: String!
    p256dh: String!
    auth: String!
  }

  # ============================================
  # Response Types
  # ============================================

  type MonitoringStatus {
    success: Boolean!
    targetId: String!
    intervalMs: Int
    message: String
  }

  type ActiveTargets {
    targetIds: [String!]!
  }

  type HealthCheck {
    status: String!
    timestamp: String!
    services: ServiceStatus!
    database: Boolean!
  }

  type ServiceStatus {
    monitor: Boolean!
    alerting: Boolean!
    notification: Boolean!
  }

  # ============================================
  # Queries (Read Operations)
  # ============================================

  type Query {
    # Health
    health: HealthCheck!

    # Targets
    targets: [Target!]!
    target(id: ID!): Target
    activeTargets: ActiveTargets!

    # Alert Rules
    alertRulesByTarget(targetId: String!): [AlertRule!]!
    alertRule(id: Int!): AlertRule

    # Incidents
    incidentsByTarget(targetId: String!): [IncidentEvent!]!
    unresolvedIncidents: [IncidentEvent!]!

    # Notifications
    notifications(userId: String): [Notification!]!
    unreadNotifications: [Notification!]!

    # Push Subscriptions
    pushSubscriptions: [PushSubscription!]!

    # Users
    currentUser: User
  }

  # ============================================
  # Mutations (Write Operations)
  # ============================================

  type Mutation {
    # Target Management
    createTarget(input: CreateTargetInput!): Target!
    updateTarget(id: ID!, input: UpdateTargetInput!): Target!
    deleteTarget(id: ID!): Boolean!

    # Monitoring Control
    startMonitoring(targetId: String!, intervalMs: Int!): MonitoringStatus!
    stopMonitoring(targetId: String!): MonitoringStatus!
    runSpeedTest(targetId: String!): MonitoringStatus!

    # Alert Rules
    createAlertRule(input: CreateAlertRuleInput!): AlertRule!
    updateAlertRule(id: Int!, input: UpdateAlertRuleInput!): AlertRule!
    deleteAlertRule(id: Int!): Boolean!

    # Incidents
    resolveIncident(id: Int!): IncidentEvent!
    resolveAllIncidents(targetId: String!): Int!

    # Notifications
    markNotificationAsRead(id: Int!): Notification!
    markAllNotificationsAsRead: Int!

    # Push Subscriptions
    createPushSubscription(input: CreatePushSubscriptionInput!): PushSubscription!
    deletePushSubscription(id: ID!): Boolean!
  }

  # ============================================
  # Subscriptions (Real-time Updates)
  # ============================================

  type Subscription {
    # Real-time target updates
    targetUpdated(targetId: String): Target!
    
    # Real-time speed test results
    speedTestCompleted(targetId: String): SpeedTestResult!
    
    # Real-time incident alerts
    incidentCreated(targetId: String): IncidentEvent!
    
    # Real-time notifications
    notificationReceived: Notification!
  }
`;
