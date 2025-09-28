export async function GET() {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "PWA Connection Monitor API",
      description:
        "API for monitoring internet connection quality with real-time speed tests and alerts using pRPC",
      version: "1.0.0",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/prpc",
        description: "Development server",
      },
    ],
    paths: {
      "/targets.list": {
        post: {
          summary: "Get all monitoring targets",
          description:
            "Retrieve a list of all monitoring targets for the current user",
          tags: ["Targets"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {},
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Target",
                    },
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/targets.create": {
        post: {
          summary: "Create a new monitoring target",
          description: "Add a new target to monitor for connection quality",
          tags: ["Targets"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateTargetRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Target created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Target",
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/targets.get": {
        post: {
          summary: "Get a specific target",
          description: "Retrieve details of a specific monitoring target",
          tags: ["Targets"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "Target ID",
                    },
                  },
                  required: ["id"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Target found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Target",
                  },
                },
              },
            },
            "404": {
              description: "Target not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/targets.update": {
        post: {
          summary: "Update a target",
          description: "Update an existing monitoring target",
          tags: ["Targets"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "Target ID",
                    },
                    name: {
                      type: "string",
                      description: "New target name",
                    },
                    address: {
                      type: "string",
                      description: "New target address",
                    },
                  },
                  required: ["id"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Target updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Target",
                  },
                },
              },
            },
            "404": {
              description: "Target not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/targets.delete": {
        post: {
          summary: "Delete a target",
          description: "Delete a monitoring target",
          tags: ["Targets"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "Target ID",
                    },
                  },
                  required: ["id"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Target deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Target not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/targets.runSpeedTest": {
        post: {
          summary: "Run a speed test on a target",
          description: "Execute a speed test for a specific monitoring target",
          tags: ["Speed Tests"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    targetId: {
                      type: "string",
                      description: "Target ID",
                    },
                    timeout: {
                      type: "number",
                      description: "Timeout in milliseconds",
                      example: 10000,
                    },
                  },
                  required: ["targetId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Speed test completed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SpeedTestResult",
                  },
                },
              },
            },
            "404": {
              description: "Target not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/targets.getResults": {
        post: {
          summary: "Get speed test results for a target",
          description:
            "Retrieve speed test results for a specific monitoring target",
          tags: ["Speed Tests"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    targetId: {
                      type: "string",
                      description: "Target ID",
                    },
                    limit: {
                      type: "number",
                      description: "Maximum number of results to return",
                    },
                  },
                  required: ["targetId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Speed test results retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/SpeedTestResult",
                    },
                  },
                },
              },
            },
            "404": {
              description: "Target not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/targets.startMonitoring": {
        post: {
          summary: "Start monitoring a target",
          description: "Start continuous monitoring for a specific target",
          tags: ["Monitoring"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    targetId: {
                      type: "string",
                      description: "Target ID",
                    },
                    intervalMs: {
                      type: "number",
                      description: "Monitoring interval in milliseconds",
                    },
                  },
                  required: ["targetId", "intervalMs"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Monitoring started successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Target not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/targets.stopMonitoring": {
        post: {
          summary: "Stop monitoring a target",
          description: "Stop continuous monitoring for a specific target",
          tags: ["Monitoring"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    targetId: {
                      type: "string",
                      description: "Target ID",
                    },
                  },
                  required: ["targetId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Monitoring stopped successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Target not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/targets.getActive": {
        post: {
          summary: "Get active monitoring targets",
          description: "Get list of targets currently being monitored",
          tags: ["Monitoring"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {},
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Active targets retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Target: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique target identifier",
            },
            name: {
              type: "string",
              description: "Human-readable target name",
            },
            address: {
              type: "string",
              description: "Target URL or IP address",
            },
            ownerId: {
              type: "string",
              description: "ID of the user who owns this target",
            },
            speedTestResults: {
              type: "array",
              items: {
                $ref: "#/components/schemas/SpeedTestResult",
              },
              description: "Speed test results for this target",
            },
            alertRules: {
              type: "array",
              items: {
                $ref: "#/components/schemas/AlertRule",
              },
              description: "Alert rules for this target",
            },
          },
          required: ["id", "name", "address", "ownerId"],
        },
        SpeedTestResult: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique result identifier",
            },
            ping: {
              type: "number",
              nullable: true,
              description: "Ping latency in milliseconds",
            },
            download: {
              type: "number",
              nullable: true,
              description: "Download speed in Mbps",
            },
            status: {
              type: "string",
              enum: ["SUCCESS", "FAILURE"],
              description: "Test status",
            },
            error: {
              type: "string",
              nullable: true,
              description: "Error message if test failed",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "When the test was performed",
            },
            targetId: {
              type: "string",
              description: "ID of the target that was tested",
            },
          },
          required: ["id", "status", "createdAt", "targetId"],
        },
        AlertRule: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique rule identifier",
            },
            name: {
              type: "string",
              description: "Human-readable rule name",
            },
            metric: {
              type: "string",
              enum: ["ping", "download"],
              description: "Metric to monitor",
            },
            condition: {
              type: "string",
              enum: ["GREATER_THAN", "LESS_THAN"],
              description: "Comparison condition",
            },
            threshold: {
              type: "number",
              description: "Threshold value for comparison",
            },
            enabled: {
              type: "boolean",
              description: "Whether the rule is active",
            },
            targetId: {
              type: "string",
              description: "ID of the target this rule applies to",
            },
          },
          required: [
            "id",
            "name",
            "metric",
            "condition",
            "threshold",
            "enabled",
            "targetId",
          ],
        },
        CreateTargetRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Target name",
              example: "Google DNS",
            },
            address: {
              type: "string",
              description: "Target address",
              example: "https://8.8.8.8",
            },
          },
          required: ["name", "address"],
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
            code: {
              type: "string",
              description: "Error code",
            },
            details: {
              type: "object",
              description: "Additional error details",
            },
          },
          required: ["error"],
        },
      },
    },
    tags: [
      {
        name: "Targets",
        description: "Target management operations",
      },
      {
        name: "Speed Tests",
        description: "Speed test operations",
      },
      {
        name: "Monitoring",
        description: "Monitoring control operations",
      },
    ],
  };

  return new Response(JSON.stringify(openApiSpec, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
