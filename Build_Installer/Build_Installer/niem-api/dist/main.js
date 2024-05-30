"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    app.setGlobalPrefix('api');
    const configOpenApi = new swagger_1.DocumentBuilder()
        .setTitle('NIEM API')
        .setDescription('NIEM API using Swagger')
        .setVersion('1.0')
        .addTag('API')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, configOpenApi);
    swagger_1.SwaggerModule.setup('api', app, document);
    const config = app.get(config_1.ConfigService);
    console.log(`PORT: ${config.get('PORT')}`);
    await app.listen(config.get('PORT'));
}
bootstrap();
//# sourceMappingURL=main.js.map