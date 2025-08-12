# Script để thêm keys thiếu vào messages.json một cách an toàn
$messagesPath = "_locales\zh\messages.json"
$messagesContent = Get-Content $messagesPath -Raw

# Danh sách các keys và translations mới cần thêm
$newKeys = @{
    "recent_activity_title" = "最近活动"
    "new_this_week" = "本周新增"
    "table_user" = "用户"
    "table_action" = "操作"
    "table_version" = "版本"
    "table_time" = "时间"
    "table_status" = "状态"
    "switched_to_power" = "切换到POWER模式"
    "minutes_ago_2" = "2分钟前"
    "active" = "活跃"
    "minutes_ago_15" = "15分钟前"
    "failed" = "失败"
    "updated_settings" = "更新设置"
    "hour_ago" = "1小时前"
    "completed" = "已完成"
    "device_registration" = "设备注册"
    "hours_ago_3" = "3小时前"
    "user_management_title" = "用户管理"
    "add_user_btn" = "添加用户"
    "analytics_insights" = "分析洞察"
    "admin_dashboard_title" = "TINI 管理面板"
    "just_now" = "刚刚"
    "admin" = "管理员"
    "employee" = "员工"
    "manager" = "经理"
    "inactive" = "未激活"
    "suspended" = "已暂停"
    "success" = "成功"
    "days_ago" = "天前"
    "hours_ago" = "小时前"
    "employee_id_col" = "员工ID"
    "name_col" = "姓名"
    "role_col" = "角色"
    "last_active_col" = "最后活跃"
    "devices_col" = "设备"
    "actions_col" = "操作"
    "add_new_user" = "添加新用户"
    "chinese" = "中文"
    "english" = "英语"
    "korean" = "韩语"
    "vietnamese" = "越南语"
    "hindi" = "印地语"
    "light_mode" = "浅色模式"
    "auto_mode" = "自动模式"
    "theme_mode" = "主题模式"
    "system_language" = "系统语言"
    "notification_settings" = "通知设置"
    "save_settings" = "保存设置"
    "login_alerts" = "登录提醒"
    "email_notifications" = "邮件通知"
    "push_notifications" = "推送通知"
    "refresh_interval" = "刷新间隔"
    "data_cache" = "数据缓存"
    "animation_effects" = "动画效果"
    "advanced_settings" = "高级设置"
    "advanced_warning" = "⚠️ 警告：高级设置可能影响系统稳定性"
    "debug_mode" = "调试模式"
    "log_level" = "日志级别"
    "max_connections" = "最大连接数"
    "request_timeout" = "请求超时"
    "reset_defaults" = "重置为默认"
    "export_settings" = "导出设置"
    "save" = "保存"
    "profile_updated" = "个人资料已更新"
    "password_changed" = "密码已更改"
    "activity" = "活动"
    "devices" = "设备"
    "employee_user_3" = "员工用户3"
    "metric_active_users" = "活跃用户指标"
}

# Kiểm tra keys nào đã tồn tại
$existingKeys = @()
$keysToAdd = @{}

foreach ($key in $newKeys.Keys) {
    $searchPattern = '"' + $key + '":\s*\{'
    if ($messagesContent -match $searchPattern) {
        $existingKeys += $key
        Write-Host "Key already exists: $key" -ForegroundColor Yellow
    } else {
        $keysToAdd[$key] = $newKeys[$key]
        Write-Host "Will add key: $key = $($newKeys[$key])" -ForegroundColor Green
    }
}

Write-Host "`nKeys to add: $($keysToAdd.Count)" -ForegroundColor Cyan
Write-Host "Keys already exist: $($existingKeys.Count)" -ForegroundColor Yellow

# Tạo content để thêm vào file
if ($keysToAdd.Count -gt 0) {
    $addContent = ""
    foreach ($key in $keysToAdd.Keys) {
        $addContent += ",`n  `"$key`": {`n    `"message`": `"$($keysToAdd[$key])`"`n  }"
    }
    
    Write-Host "`nContent to add:"
    Write-Host $addContent
}
