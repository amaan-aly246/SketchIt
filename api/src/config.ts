import { config as loadEnv } from "dotenv";

loadEnv()
const config = {
  env: {
    port: process.env.PORT
  }
}

export default config
