import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import { CreateSecretForm } from "@/components/create-secret/create-secret-form";

vi.mock("@/lib/crypto/encrypt", () => ({
  encryptMessage: vi.fn(async () => ({
    version: 1,
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA-256",
    iterations: 600000,
    salt: "A".repeat(22),
    iv: "B".repeat(16),
    ciphertext: "C".repeat(22),
  })),
}));

describe("create form privacy boundary", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("never includes plaintext or password in the API request", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) =>
      new Response(JSON.stringify({ id: "123e4567-e89b-42d3-a456-426614174000", url: "/en/open/123e4567-e89b-42d3-a456-426614174000", expiresAt: new Date().toISOString() }), { status: 201, headers: { "Content-Type": "application/json" } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<CreateSecretForm locale="en" copy={en.create} />);
    const plaintext = "never send this original";
    const password = "CorrectHorseBatteryStaple1!";
    fireEvent.change(screen.getByLabelText(en.create.messageLabel), { target: { value: plaintext } });
    fireEvent.change(screen.getByLabelText(en.create.passwordLabel), { target: { value: password } });
    fireEvent.change(screen.getByLabelText(en.create.confirmLabel), { target: { value: password } });
    fireEvent.click(screen.getByRole("button", { name: en.create.submit }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const body = String(fetchMock.mock.calls[0]?.[1]?.body);
    expect(body).not.toContain(plaintext);
    expect(body).not.toContain(password);
    expect(body).toContain('"ciphertext"');
  });
});
