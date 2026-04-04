import { NotifierCatalog } from "../../../src/notifiers/core/NotifierCatalog.js";
import { NotifierRegistry } from "../../../src/notifiers/core/NotifierRegistry.js";
import { NotifierValidator } from "../../../src/notifiers/core/NotifierValidator.js";

describe("NotifierValidator", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns success for valid notifier configuration", () => {
    const result = NotifierValidator.validateConfiguration();

    expect(result).toEqual({
      result: true,
      info: "✅ Notifier configuration validated successfully.",
    });
  });

  test("returns mismatch error when list and registry sizes differ", () => {
    jest.spyOn(NotifierCatalog, "getSupportedNotifiers").mockReturnValue({
      size: 1,
      entries: () => [["email", "MailNotifier"]],
    });
    jest.spyOn(NotifierRegistry, "getNotifiersRegistry").mockReturnValue({
      size: 2,
      has: () => true,
    });

    const result = NotifierValidator.validateConfiguration();

    expect(result).toEqual({ result: false, info: "❌ Notifier registry size mismatch." });
  });

  test("returns missing backend class error when class is not present in registry", () => {
    jest.spyOn(NotifierCatalog, "getSupportedNotifiers").mockReturnValue({
      size: 1,
      entries: () => [["email", "MailNotifier"]],
    });
    jest.spyOn(NotifierRegistry, "getNotifiersRegistry").mockReturnValue({
      size: 1,
      has: () => false,
    });

    const result = NotifierValidator.validateConfiguration();

    expect(result).toEqual({
      result: false,
      info: "❌ Missing backend class \"MailNotifier\" for notifier \"email\".",
    });
  });
});
