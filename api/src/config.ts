import { config as loadEnv } from "dotenv";

loadEnv()
const config = {
  env: {
    port: process.env.PORT,
    db_url: process.env.DATA_BASE_URL
  }
}

export default config
