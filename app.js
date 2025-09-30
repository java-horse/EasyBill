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
app.get('/api/hello', async (req, res) => {
    // const msg = {
    //     Content: '原价￥17.70优惠银行卡随机立减优惠￥0.13,当前状态支付成功支付时间2025年9月8日 12:29:57商品商户单号XP1425090812200708746056006785收单机构财付通支付科技有限公司支付方式浙江农商联合银行信用卡(2070)由网联清算有限公司提供付款清算服务交易单号4200002825202509080643145473商户单号XP1425090812200708746056006785杭州园区便利店-4.30交易成功订单金额4.80碰一下立减-0.50支付时间2025-09-17 08:41:21付款方式招商银行信用卡(4171)arrow商品说明直接付款|LDN7HDQM024100952453支付奖励立即领取2积分收单机构银盛支付服务股份有限公司清算机构中国银联股份有限公司收款方全称杭州建德佳品便利店(个体工商户)订单号2025091722001443651424179507商家订单号商家可扫码退款或查询交易'
    // };
    res.send('hello world');
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