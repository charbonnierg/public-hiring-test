import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { dataSource } from "../config/dataSource";
import { AppModule } from "./app.module";

async function bootstrap() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
  });

  const openapiConfig = new DocumentBuilder()
    .setTitle("Food Carbon Emission API")
    .setDescription("The food carbon emission API")
    .setVersion("0.1.0")
    .build();

  const document = SwaggerModule.createDocument(app, openapiConfig);
  SwaggerModule.setup("docs", app, document);

  await app.listen(3000);
}

Logger.log(`Server running on http://localhost:3000`, "Bootstrap");
bootstrap();
