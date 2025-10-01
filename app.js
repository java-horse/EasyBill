const express = require('express');

// 导入前置配置
const { SERVER_CONFIG, FEISHU_CONFIG } = require('./config');

// 导入大模型服务
const { LLMServiceFactory } = require('./service/llm-service');
const { sendToFeishuWebhook } = require('./service/webhook-service');



// 中间件配置
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 测试接口
app.get('/', async (req, res) => {
    res.send('hello world');
});

// LLM识别账单
app.post('/api/chat', async (req, res) => {
    const { origin } = req.body;
    if (!origin) {
        return res.status(400).json({
            success: false
        });
    }
    try {
        const llmService = LLMServiceFactory.getService('GLM');
        const modelStartTime = Date.now();
        const bill = await llmService.analyzeBillMessage(origin);
        const modelEndTime = Date.now();
        console.log(`大模型识别耗时: ${modelEndTime - modelStartTime}ms`);
        res.json({
            success: true,
            data: bill
        });
    } catch (error) {
        console.error('处理账单失败:', error);
        res.status(500).json({
            success: false
        });
    }
});

// LLM识别记账
app.post('/api/bill', async (req, res) => {
    const { origin } = req.body;
    if (!origin) {
        return res.status(400).json({
            success: false
        });
    }
    try {
        const startTime = Date.now();
        const llmService = LLMServiceFactory.getService('GLM');
        // 记录大模型识别耗时
        const modelStartTime = Date.now();
        const bill = await llmService.analyzeBillMessage(origin);
        const modelEndTime = Date.now();
        console.log(`大模型识别耗时: ${modelEndTime - modelStartTime}ms`);
        // 记录飞书推送耗时
        const feishuStartTime = Date.now();
        await sendToFeishuWebhook(JSON.stringify({
            origin: `${bill.date}|${bill.type}|${bill.category}|${bill.amount}|${bill.remark}|${bill.payment}|${bill.goods}`
        }), FEISHU_CONFIG.webhookUrl);
        const feishuEndTime = Date.now();
        console.log(`飞书推送耗时: ${feishuEndTime - feishuStartTime}ms`);
        // 记录总耗时
        const endTime = Date.now();
        console.log(`API总耗时: ${endTime - startTime}ms`);
        res.json({
            success: true
        });
    } catch (error) {
        console.error('处理账单失败:', error);
        res.status(500).json({
            success: false
        });
    }
});

// 启动服务器
app.listen(SERVER_CONFIG.port, () => {
    console.log(`server listening at http://localhost:${SERVER_CONFIG.port}`);
});