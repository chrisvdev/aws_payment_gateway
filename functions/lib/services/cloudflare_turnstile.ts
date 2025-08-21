import { AxiosInstance, AxiosResponse } from "axios";
import createService from "../third_party_base_service.ts";
import { logger } from "../lambda.ts";
import getParameter from "../get_parameter.ts";

const CLOUDFLARE_SECRET_KEY = await getParameter("CLOUDFLARE_SECRET_KEY");

if (
  typeof CLOUDFLARE_SECRET_KEY !== "string" ||
  CLOUDFLARE_SECRET_KEY.length === 0
) {
  logger.error("CLOUDFLARE_SECRET_KEY is not set");
  throw new Error("CLOUDFLARE_SECRET_KEY is not set");
}

type VerifyResponse = {
  success: boolean;
  "error-codes": unknown[];
  challenge_ts: string;
  hostname: string;
};

class CloudflareTurnstileService {
  private service: AxiosInstance;
  constructor(url: string) {
    this.service = createService(url, "CloudflareTurnstileService");
  }

  async verify(token: string, ip: string): Promise<boolean> {
    const data = new FormData();
    data.append("secret", CLOUDFLARE_SECRET_KEY);
    data.append("response", token);
    data.append("remoteip", ip);
    try {
      const response = await this.service.post<
        FormData,
        AxiosResponse<VerifyResponse>
      >("/siteverify", data);
      return response.data.success ? true : false;
    } catch (error) {
      logger.error("verify error", error as Error);
      throw error;
    }
  }
}

const cloudflareTurnstileService = new CloudflareTurnstileService(
  "https://challenges.cloudflare.com/turnstile/v0/"
);
export default cloudflareTurnstileService;
