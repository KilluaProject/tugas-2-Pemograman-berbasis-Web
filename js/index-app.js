var app = new Vue({
    el: '#app',
    data: {
        currentUser: {
            email: 'admin@ecampus.ut.ac.id',
            nama: 'Raden Agung Prakoso Wibowo'
        },
        tanggalHariIni: '',
        menus: [
            {
                judul: 'Stok Bahan Ajar',
                url: 'stok.html',
                deskripsi: 'Kelola daftar stok, filter UPBJJ & kategori, pantau safety stock, dan tambah bahan ajar baru.'
            },
            {
                judul: 'Tracking DO',
                url: 'tracking.html',
                deskripsi: 'Lacak status pengiriman bahan ajar mahasiswa dan input Delivery Order (DO) baru.'
            }
        ]
    },
    created: function () {
        try {
            var savedUser = JSON.parse(localStorage.getItem('sitta_user'));
            if (savedUser && savedUser.email) {
                this.currentUser = savedUser;
            }
        } catch (e) {
            console.error('Gagal membaca data sesi:', e);
        }

        var now = new Date();
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.tanggalHariIni = now.toLocaleDateString('id-ID', options);
    },
    methods: {
        logout: function () {
            if (confirm('Apakah Anda yakin ingin keluar dari sistem SITTA?')) {
                localStorage.removeItem('sitta_user');
                window.location.href = 'login.html';
            }
        }
    }
});
