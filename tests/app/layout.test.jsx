import RootLayout, { metadata } from "../../src/app/layout.js";
import { getAppVersion } from "@/lib/AppVersion";

jest.mock("@/lib/AppVersion", () => ({
  getAppVersion: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  ToastContainer: () => null,
}));

jest.mock("@/components/PageHeader", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/context/LoginProvider", () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock("@/context/PageProvider", () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

describe("app/layout", () => {
  test("exports expected metadata", () => {
    expect(metadata.title).toBe("data-monitor");
    expect(metadata.icons.icon).toBe("/icon.png");
  });

  test("resolves app version while building layout tree", () => {
    getAppVersion.mockReturnValueOnce("1.2.3");

    const tree = RootLayout({ children: null });

    expect(tree).toBeTruthy();
    expect(getAppVersion).toHaveBeenCalled();
  });
});
