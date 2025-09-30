function assembleBillPrompt(message) {
  return `请分析以下文本，提取出账单信息，并以JSON格式返回；
  文本：${message}
  请严格按照以下字段返回JSON格式数据，不要添加任何额外信息：
  {
    "date": "yyyy-MM-dd HH:mm:ss", // 如果文本不包含日期，使用当前时间
    "amount": 数字, // 根据收入或支出显示正负数字
    "type": "支出"或"收入",
    "category": "账单分类",
    "payment": "付款方式",
    "goods": "商品信息",
    "remark": "消费地点/场景备注"
  }
  注意：
  1. 如果文本中有收入相关关键词，amount为正数；有支出相关关键词，amount为负数
  2. 如果文本中没有具体日期，使用当前时间
  3. 请确保返回的是有效的JSON字符串，不要包含Markdown代码块标记`;
}

function cleanJsonContent(content) {
  content = content.replace(/^```\s*json?\s*/, '');
  content = content.replace(/```\s*$/, '');
  return content.trim();
}

module.exports = {
  assembleBillPrompt,
  cleanJsonContent
};