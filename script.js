// IT岗位求职记录系统 - JavaScript逻辑

// 全局变量
let jobs = [];
let currentEditingJobId = null;

// DOM元素引用
const DOM = {
    jobForm: document.getElementById('job-form'),
    jobIdInput: document.getElementById('job-id'),
    companyNameInput: document.getElementById('company-name'),
    jobTitleInput: document.getElementById('job-title'),
    salaryInput: document.getElementById('salary'),
    locationInput: document.getElementById('location'),
    requirementsInput: document.getElementById('requirements'),
    notesInput: document.getElementById('notes'),
    statusSelect: document.getElementById('status'),
    cancelEditBtn: document.getElementById('cancel-edit'),
    jobsList: document.getElementById('jobs-list'),
    searchInput: document.getElementById('search-input'),
    statusFilter: document.getElementById('status-filter'),
    clearFilterBtn: document.getElementById('clear-filter'),
    totalCountSpan: document.getElementById('total-count'),
    jobDetailModal: document.getElementById('job-detail-modal'),
    closeModal: document.querySelector('.close-modal'),
    detailCompany: document.getElementById('detail-company'),
    detailTitle: document.getElementById('detail-title'),
    detailSalary: document.getElementById('detail-salary'),
    detailLocation: document.getElementById('detail-location'),
    detailStatus: document.getElementById('detail-status'),
    detailRequirements: document.getElementById('detail-requirements'),
    detailNotes: document.getElementById('detail-notes'),
    detailTime: document.getElementById('detail-time')
};

// 初始化应用
function initApp() {
    // 从LocalStorage加载数据
    loadJobs();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 渲染岗位列表
    renderJobsList(jobs);
}

// 从LocalStorage加载岗位数据
function loadJobs() {
    const savedJobs = localStorage.getItem('it-jobs');
    if (savedJobs) {
        jobs = JSON.parse(savedJobs);
    }
}

// 保存岗位数据到LocalStorage
function saveJobs() {
    localStorage.setItem('it-jobs', JSON.stringify(jobs));
}

// 绑定事件监听器
function bindEventListeners() {
    // 表单提交事件
    DOM.jobForm.addEventListener('submit', handleJobFormSubmit);
    
    // 取消编辑按钮
    DOM.cancelEditBtn.addEventListener('click', cancelEdit);
    
    // 搜索和筛选事件
    DOM.searchInput.addEventListener('input', handleFilterChange);
    DOM.statusFilter.addEventListener('change', handleFilterChange);
    DOM.clearFilterBtn.addEventListener('click', clearFilters);
    
    // 模态框事件
    DOM.closeModal.addEventListener('click', closeJobDetailModal);
    window.addEventListener('click', (e) => {
        if (e.target === DOM.jobDetailModal) {
            closeJobDetailModal();
        }
    });
}

// 处理表单提交
function handleJobFormSubmit(e) {
    e.preventDefault();
    
    const jobData = {
        companyName: DOM.companyNameInput.value.trim(),
        jobTitle: DOM.jobTitleInput.value.trim(),
        salary: DOM.salaryInput.value.trim(),
        location: DOM.locationInput.value.trim(),
        requirements: DOM.requirementsInput.value.trim(),
        notes: DOM.notesInput.value.trim(),
        status: DOM.statusSelect.value
    };
    
    if (currentEditingJobId) {
        // 编辑现有岗位
        updateJob(currentEditingJobId, jobData);
    } else {
        // 添加新岗位
        addJob(jobData);
    }
    
    // 重置表单
    resetForm();
}

// 添加新岗位
function addJob(jobData) {
    const newJob = {
        id: Date.now().toString(),
        ...jobData,
        createdAt: new Date().toISOString()
    };
    
    jobs.unshift(newJob); // 添加到数组开头
    saveJobs();
    renderJobsList(getFilteredJobs());
    
    showNotification('岗位添加成功！');
}

// 更新岗位
function updateJob(jobId, jobData) {
    const jobIndex = jobs.findIndex(job => job.id === jobId);
    if (jobIndex !== -1) {
        jobs[jobIndex] = {
            ...jobs[jobIndex],
            ...jobData
        };
        saveJobs();
        renderJobsList(getFilteredJobs());
        showNotification('岗位更新成功！');
    }
}

// 删除岗位
function deleteJob(jobId) {
    if (confirm('确定要删除这个岗位记录吗？')) {
        jobs = jobs.filter(job => job.id !== jobId);
        saveJobs();
        renderJobsList(getFilteredJobs());
        showNotification('岗位删除成功！');
    }
}

// 编辑岗位
function editJob(jobId) {
    const job = jobs.find(job => job.id === jobId);
    if (job) {
        currentEditingJobId = jobId;
        DOM.jobIdInput.value = jobId;
        DOM.companyNameInput.value = job.companyName || '';
        DOM.jobTitleInput.value = job.jobTitle || '';
        DOM.salaryInput.value = job.salary || '';
        DOM.locationInput.value = job.location || '';
        DOM.requirementsInput.value = job.requirements || '';
        DOM.notesInput.value = job.notes || '';
        DOM.statusSelect.value = job.status || '未投递';
        
        // 显示取消编辑按钮
        DOM.cancelEditBtn.style.display = 'inline-block';
        
        // 滚动到表单区域
        document.getElementById('add-job-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// 取消编辑
function cancelEdit() {
    resetForm();
    showNotification('已取消编辑');
}

// 重置表单
function resetForm() {
    DOM.jobForm.reset();
    currentEditingJobId = null;
    DOM.jobIdInput.value = '';
    DOM.cancelEditBtn.style.display = 'none';
}

// 显示岗位详情
function showJobDetail(jobId) {
    const job = jobs.find(job => job.id === jobId);
    if (job) {
        DOM.detailCompany.textContent = job.companyName || '未填写';
        DOM.detailTitle.textContent = job.jobTitle || '未填写';
        DOM.detailSalary.textContent = job.salary || '未填写';
        DOM.detailLocation.textContent = job.location || '未填写';
        DOM.detailStatus.textContent = job.status || '未设置';
        DOM.detailRequirements.textContent = job.requirements || '无具体要求';
        DOM.detailNotes.textContent = job.notes || '无备注信息';
        DOM.detailTime.textContent = formatDate(job.createdAt);
        
        // 显示模态框
        DOM.jobDetailModal.style.display = 'block';
    }
}

// 关闭岗位详情模态框
function closeJobDetailModal() {
    DOM.jobDetailModal.style.display = 'none';
}

// 处理筛选变化
function handleFilterChange() {
    const filteredJobs = getFilteredJobs();
    renderJobsList(filteredJobs);
}

// 获取筛选后的岗位列表
function getFilteredJobs() {
    const searchTerm = DOM.searchInput.value.toLowerCase().trim();
    const statusFilter = DOM.statusFilter.value;
    
    return jobs.filter(job => {
        // 搜索筛选
        const matchesSearch = !searchTerm || 
            job.companyName.toLowerCase().includes(searchTerm) || 
            job.jobTitle.toLowerCase().includes(searchTerm);
        
        // 状态筛选
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
}

// 清除筛选条件
function clearFilters() {
    DOM.searchInput.value = '';
    DOM.statusFilter.value = 'all';
    renderJobsList(jobs);
    showNotification('筛选条件已清除');
}

// 渲染岗位列表
function renderJobsList(jobsToRender) {
    DOM.jobsList.innerHTML = '';
    
    if (jobsToRender.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'empty-message';
        emptyRow.innerHTML = '<td colspan="7">暂无岗位记录</td>';
        DOM.jobsList.appendChild(emptyRow);
    } else {
        jobsToRender.forEach(job => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHTML(job.companyName || '-')}</td>
                <td>${escapeHTML(job.jobTitle || '-')}</td>
                <td>${escapeHTML(job.salary || '-')}</td>
                <td>${escapeHTML(job.location || '-')}</td>
                <td>
                    <span class="status-badge status-${escapeHTML(job.status)}">
                        ${escapeHTML(job.status || '未设置')}
                    </span>
                </td>
                <td>${formatDate(job.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn detail-btn" data-id="${job.id}">详情</button>
                        <button class="btn edit-btn" data-id="${job.id}">编辑</button>
                        <button class="btn delete-btn" data-id="${job.id}">删除</button>
                    </div>
                </td>
            `;
            DOM.jobsList.appendChild(row);
        });
        
        // 绑定操作按钮事件
        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', () => showJobDetail(btn.dataset.id));
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editJob(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteJob(btn.dataset.id));
        });
    }
    
    // 更新统计信息
    DOM.totalCountSpan.textContent = jobsToRender.length;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// HTML转义，防止XSS攻击
function escapeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 显示通知
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #48bb78;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 2秒后移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// 添加一些示例数据（如果没有数据）
function addSampleDataIfEmpty() {
    if (jobs.length === 0) {
        const sampleJobs = [
            {
                id: '1',
                companyName: '阿里巴巴',
                jobTitle: '前端开发工程师',
                salary: '25k-35k',
                location: '杭州',
                requirements: '1. 本科及以上学历，计算机相关专业\n2. 3年以上前端开发经验\n3. 精通React/Vue等主流框架\n4. 熟悉Node.js和后端技术',
                notes: '内推投递，等待面试',
                status: '已投递',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                companyName: '腾讯',
                jobTitle: '后端开发工程师',
                salary: '30k-45k',
                location: '深圳',
                requirements: '1. 本科及以上学历\n2. 5年以上后端开发经验\n3. 精通Java/Python\n4. 熟悉微服务架构',
                notes: '技术面已通过',
                status: '面试中',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '3',
                companyName: '字节跳动',
                jobTitle: '全栈开发工程师',
                salary: '35k-50k',
                location: '北京',
                requirements: '1. 计算机相关专业背景\n2. 4年以上全栈开发经验\n3. 熟悉前后端技术栈\n4. 有大型项目经验',
                notes: '准备面试中',
                status: '未投递',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        jobs = sampleJobs;
        saveJobs();
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    initApp();
    addSampleDataIfEmpty();
    renderJobsList(jobs);
});