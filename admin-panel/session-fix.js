// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 661d2ea | Time: 2025-08-17T12:09:46Z
// Watermark: TINI_1755432586_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// CRITICAL SESSION FIX - Thêm vào frontend để invalidate session ngay lập tức

// Fix cho frontend: Khi delete user, check và logout nếu là current user
async function deleteUserByIdWithSessionCheck(userId, userName) {
    // Get current admin info first
    const currentAdmin = await this.getCurrentAdminInfo();
    
    // Check if trying to delete self
    if (currentAdmin && (
        userId === currentAdmin.username || 
        userName === currentAdmin.username ||
        userId.toString().includes(currentAdmin.username) ||
        userName.includes(currentAdmin.username)
    )) {
        this.showNotification('❌ Bạn không thể xóa chính mình!', 'error');
        return;
    }

    const confirmed = confirm(`您确定要删除用户 "${userName}" 吗？此操作不可撤销。`);
    if (confirmed) {
        // Show loading state
        this.showNotification('正在删除用户...', 'info');

        // Call API to delete user from database
        const apiUrl = `${window.location.origin}/api/users/delete`;
        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('用户删除成功！', 'success');
                
                // CRITICAL: Check if the deleted user was current admin
                if (data.deletedUser && currentAdmin && (
                    data.deletedUser.username === currentAdmin.username ||
                    data.deletedUser.id === currentAdmin.username
                )) {
                    // Force logout current admin since they were deleted
                    this.showNotification('您的账户已被删除，正在退出...', 'warning');
                    setTimeout(() => {
                        // Clear all local data
                        localStorage.clear();
                        sessionStorage.clear();
                        
                        // Clear cookies
                        document.cookie.split(";").forEach(function(c) { 
                            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                        });
                        
                        // Redirect to login
                        window.location.href = '/admin-panel.html';
                    }, 2000);
                    return;
                }
                
                // Reload user table for others
                this.loadUsersTable();
            } else {
                this.showNotification(data.error || '删除失败', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showNotification('网络错误', 'error');
        }
    }
}
