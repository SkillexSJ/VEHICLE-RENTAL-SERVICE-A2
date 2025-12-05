import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
    port : process.env.PORT,
    jwt_secret : process.env.JWT_SECRET,
    connection_string : `${process.env.CONNECTION_STRING}`
}

export default config
