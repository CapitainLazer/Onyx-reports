// ===== UI MANAGER =====

class UIManager {
    static init() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.closeModal(activeModal.id);
                }
            }
        });

        this.setupDropdowns();
    }

    static setupDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            const trigger = dropdown.querySelector('.btn-icon, .dropdown-trigger');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (!trigger || !menu) return;

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = menu.classList.contains('active');
                document.querySelectorAll('.dropdown-menu.active').forEach(m => m.classList.remove('active'));
                if (!isOpen) menu.classList.add('active');
            });
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu.active').forEach(m => m.classList.remove('active'));
        });
    }

    static openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal "${modalId}" introuvable`);
            return;
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('active');
        if (!document.querySelector('.modal.active')) {
            document.body.style.overflow = '';
        }
    }

    static showToast(message, type = 'success', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(400px)';
            toast.style.transition = 'all 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});
