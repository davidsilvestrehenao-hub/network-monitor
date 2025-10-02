import { test, expect } from "@playwright/test";

test.describe("Target Management E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");
  });

  test("should create and manage monitoring targets", async ({ page }) => {
    // Navigate to targets page
    await page.click('[data-testid="targets-tab"]');
    await expect(page.locator('[data-testid="targets-page"]')).toBeVisible();

    // Create new target
    await page.click('[data-testid="create-target-button"]');
    await expect(
      page.locator('[data-testid="create-target-modal"]')
    ).toBeVisible();

    // Fill in target details
    await page.fill('[data-testid="target-name-input"]', "Google DNS");
    await page.fill('[data-testid="target-address-input"]', "https://8.8.8.8");
    await page.click('[data-testid="save-target-button"]');

    // Verify target appears in list
    await expect(page.locator('[data-testid="target-list"]')).toContainText(
      "Google DNS"
    );
    await expect(page.locator('[data-testid="target-list"]')).toContainText(
      "https://8.8.8.8"
    );

    // Verify target status is initially stopped
    await expect(
      page.locator('[data-testid="target-status"]').first()
    ).toContainText("Stopped");

    // Start monitoring
    await page.click('[data-testid="start-monitoring-button"]');
    await expect(
      page.locator('[data-testid="target-status"]').first()
    ).toContainText("Active");

    // Wait for first speed test result
    await expect(page.locator('[data-testid="speed-test-result"]')).toBeVisible(
      { timeout: 10000 }
    );

    // Verify speed test metrics are displayed
    await expect(page.locator('[data-testid="ping-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-value"]')).toBeVisible();

    // Stop monitoring
    await page.click('[data-testid="stop-monitoring-button"]');
    await expect(
      page.locator('[data-testid="target-status"]').first()
    ).toContainText("Stopped");

    // Edit target
    await page.click('[data-testid="edit-target-button"]');
    await expect(
      page.locator('[data-testid="edit-target-modal"]')
    ).toBeVisible();

    await page.fill(
      '[data-testid="target-name-input"]',
      "Google DNS (Updated)"
    );
    await page.click('[data-testid="save-target-button"]');

    // Verify target was updated
    await expect(page.locator('[data-testid="target-list"]')).toContainText(
      "Google DNS (Updated)"
    );

    // Delete target
    await page.click('[data-testid="delete-target-button"]');
    await expect(
      page.locator('[data-testid="confirm-delete-modal"]')
    ).toBeVisible();
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify target was deleted
    await expect(page.locator('[data-testid="target-list"]')).not.toContainText(
      "Google DNS (Updated)"
    );
  });

  test("should display speed test results in charts", async ({ page }) => {
    // Create a target first
    await page.click('[data-testid="targets-tab"]');
    await page.click('[data-testid="create-target-button"]');
    await page.fill('[data-testid="target-name-input"]', "Test Target");
    await page.fill(
      '[data-testid="target-address-input"]',
      "https://httpbin.org/delay/1"
    );
    await page.click('[data-testid="save-target-button"]');

    // Start monitoring
    await page.click('[data-testid="start-monitoring-button"]');

    // Wait for some speed test results
    await expect(page.locator('[data-testid="speed-test-result"]')).toBeVisible(
      { timeout: 10000 }
    );

    // Navigate to charts page
    await page.click('[data-testid="charts-tab"]');
    await expect(page.locator('[data-testid="charts-page"]')).toBeVisible();

    // Verify charts are displayed
    await expect(page.locator('[data-testid="ping-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-chart"]')).toBeVisible();

    // Verify chart has data
    await expect(
      page.locator('[data-testid="ping-chart"] canvas')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="download-chart"] canvas')
    ).toBeVisible();
  });

  test("should create and manage alert rules", async ({ page }) => {
    // Create a target first
    await page.click('[data-testid="targets-tab"]');
    await page.click('[data-testid="create-target-button"]');
    await page.fill('[data-testid="target-name-input"]', "Alert Test Target");
    await page.fill(
      '[data-testid="target-address-input"]',
      "https://httpbin.org/delay/2"
    );
    await page.click('[data-testid="save-target-button"]');

    // Navigate to alerts page
    await page.click('[data-testid="alerts-tab"]');
    await expect(page.locator('[data-testid="alerts-page"]')).toBeVisible();

    // Create new alert rule
    await page.click('[data-testid="create-alert-button"]');
    await expect(
      page.locator('[data-testid="create-alert-modal"]')
    ).toBeVisible();

    // Fill in alert rule details
    await page.fill('[data-testid="alert-name-input"]', "High Ping Alert");
    await page.selectOption('[data-testid="alert-metric-select"]', "ping");
    await page.selectOption(
      '[data-testid="alert-condition-select"]',
      "GREATER_THAN"
    );
    await page.fill('[data-testid="alert-threshold-input"]', "1000");
    await page.selectOption(
      '[data-testid="alert-target-select"]',
      "Alert Test Target"
    );
    await page.click('[data-testid="save-alert-button"]');

    // Verify alert rule appears in list
    await expect(
      page.locator('[data-testid="alert-rules-list"]')
    ).toContainText("High Ping Alert");
    await expect(
      page.locator('[data-testid="alert-rules-list"]')
    ).toContainText("ping > 1000");

    // Toggle alert rule
    await page.click('[data-testid="toggle-alert-button"]');
    await expect(
      page.locator('[data-testid="alert-status"]').first()
    ).toContainText("Disabled");

    // Re-enable alert rule
    await page.click('[data-testid="toggle-alert-button"]');
    await expect(
      page.locator('[data-testid="alert-status"]').first()
    ).toContainText("Enabled");

    // Delete alert rule
    await page.click('[data-testid="delete-alert-button"]');
    await expect(
      page.locator('[data-testid="confirm-delete-modal"]')
    ).toBeVisible();
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify alert rule was deleted
    await expect(
      page.locator('[data-testid="alert-rules-list"]')
    ).not.toContainText("High Ping Alert");
  });

  test("should handle notifications", async ({ page }) => {
    // Navigate to notifications page
    await page.click('[data-testid="notifications-tab"]');
    await expect(
      page.locator('[data-testid="notifications-page"]')
    ).toBeVisible();

    // Check if there are any existing notifications
    const notificationCount = await page
      .locator('[data-testid="notification-item"]')
      .count();

    if (notificationCount > 0) {
      // Mark first notification as read
      await page.click('[data-testid="mark-read-button"]');
      await expect(
        page.locator('[data-testid="notification-item"]').first()
      ).toHaveClass(/read/);
    }

    // Mark all notifications as read
    await page.click('[data-testid="mark-all-read-button"]');
    await expect(
      page.locator('[data-testid="no-notifications"]')
    ).toBeVisible();

    // Test push notification subscription
    await page.click('[data-testid="subscribe-notifications-button"]');

    // This would normally trigger a browser permission dialog
    // In a real test, you might need to mock the notification permission
    await expect(
      page.locator('[data-testid="notification-subscription-status"]')
    ).toContainText("Subscribed");
  });

  test("should be responsive on mobile devices", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to targets page
    await page.click('[data-testid="targets-tab"]');

    // Verify mobile navigation works
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Create target on mobile
    await page.click('[data-testid="create-target-button"]');
    await page.fill('[data-testid="target-name-input"]', "Mobile Test");
    await page.fill(
      '[data-testid="target-address-input"]',
      "https://example.com"
    );
    await page.click('[data-testid="save-target-button"]');

    // Verify target was created
    await expect(page.locator('[data-testid="target-list"]')).toContainText(
      "Mobile Test"
    );

    // Test mobile chart view
    await page.click('[data-testid="charts-tab"]');
    await expect(page.locator('[data-testid="mobile-charts"]')).toBeVisible();
  });

  test("should work offline", async ({ page }) => {
    // Create a target first
    await page.click('[data-testid="targets-tab"]');
    await page.click('[data-testid="create-target-button"]');
    await page.fill('[data-testid="target-name-input"]', "Offline Test");
    await page.fill(
      '[data-testid="target-address-input"]',
      "https://example.com"
    );
    await page.click('[data-testid="save-target-button"]');

    // Start monitoring to generate some data
    await page.click('[data-testid="start-monitoring-button"]');
    await expect(page.locator('[data-testid="speed-test-result"]')).toBeVisible(
      { timeout: 10000 }
    );

    // Go offline
    await page.context().setOffline(true);

    // Verify offline indicator is shown
    await expect(
      page.locator('[data-testid="offline-indicator"]')
    ).toBeVisible();

    // Navigate to charts page (should work offline)
    await page.click('[data-testid="charts-tab"]');
    await expect(page.locator('[data-testid="charts-page"]')).toBeVisible();

    // Verify charts still show historical data
    await expect(page.locator('[data-testid="ping-chart"]')).toBeVisible();

    // Go back online
    await page.context().setOffline(false);

    // Verify online indicator is shown
    await expect(
      page.locator('[data-testid="online-indicator"]')
    ).toBeVisible();
  });
});
