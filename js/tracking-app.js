var app = new Vue({
    el: '#app',
    data: {
        // Data referensi dari dataBahanAjar.js
        upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
        pengirimanList: [
            { kode: "REG", nama: "Reguler (3-5 hari)" },
            { kode: "EXP", nama: "Ekspres (1-2 hari)" }
        ],
        paket: [
            { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116", "EKMA4115"], harga: 120000 },
            { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201", "FISIP4001"], harga: 140000 }
        ],
        stok: [
            { kode: "EKMA4116", judul: "Pengantar Manajemen" },
            { kode: "EKMA4115", judul: "Pengantar Akuntansi" },
            { kode: "BIOL4201", judul: "Biologi Umum (Praktikum)" },
            { kode: "FISIP4001", judul: "Dasar-Dasar Sosiologi" }
        ],
        tracking: {
            "DO2025-001": {
                nim: "123456789",
                nama: "Rina Wulandari",
                status: "Dalam Perjalanan",
                ekspedisi: "JNE Reguler (3-5 hari)",
                tanggalKirim: "2025-08-25",
                paket: "PAKET-UT-001",
                total: 120000,
                perjalanan: [
                    { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGSEL" },
                    { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: JAKSEL" },
                    { waktu: "2025-08-26 08:44:01", keterangan: "Diteruskan ke Kantor Tujuan" }
                ]
            }
        },

        // State Form Input DO Baru
        formDO: {
            nim: "",
            nama: "",
            upbjj: "",
            ekspedisi: "",
            kodePaket: "",
            tanggalKirim: ""
        },
        errors: {},
        searchQuery: "",
        infoWatcher: "Silakan isi formulir untuk membuat Nomor DO baru atau cari status pengiriman di bawah."
    },

    created: function () {
        // Set default tanggal kirim menggunakan fungsi Date local time saat halaman dibuka
        this.setTanggalHariIni();
    },

    computed: {
        // Mengubah object tracking menjadi array biar gampang di render dan di sortir
        trackingArray: function () {
            var list = [];
            for (var key in this.tracking) {
                if (Object.prototype.hasOwnProperty.call(this.tracking, key)) {
                    var item = this.tracking[key];
                    list.push({
                        noDO: key,
                        nim: item.nim,
                        nama: item.nama,
                        status: item.status,
                        ekspedisi: item.ekspedisi,
                        tanggalKirim: item.tanggalKirim,
                        paket: item.paket,
                        total: item.total,
                        perjalanan: item.perjalanan
                    });
                }
            }
            return list;
        },

        // Filter daftar tracking berdasarkan pencarian
        filteredTrackingList: function () {
            if (!this.searchQuery) {
                return this.trackingArray;
            }
            var q = this.searchQuery.toLowerCase();
            return this.trackingArray.filter(function (item) {
                return item.noDO.toLowerCase().indexOf(q) !== -1 ||
                    item.nim.toLowerCase().indexOf(q) !== -1 ||
                    item.nama.toLowerCase().indexOf(q) !== -1;
            });
        },

        // Fitur untuk buat angka delivery order otomatis
        generatedNomorDO: function () {
            var tahun = new Date().getFullYear();
            var jumlahData = Object.keys(this.tracking).length + 1;
            var sequence = String(jumlahData).padStart(3, '0');
            return "DO" + tahun + "-" + sequence;
        },

        // ambil object paket yang dipilih
        selectedPaketObj: function () {
            var kode = this.formDO.kodePaket;
            return this.paket.find(function (p) {
                return p.kode === kode;
            }) || null;
        },

        //ambil total harga dari paket yang dipilih
        totalHargaPaket: function () {
            return this.selectedPaketObj ? this.selectedPaketObj.harga : 0;
        }
    },

    watch: {
        // Watcher 1: Memantau perubahan pilihan Paket Bahan Ajar
        'formDO.kodePaket': function (newVal) {
            if (newVal && this.selectedPaketObj) {
                this.infoWatcher = "Paket " + this.selectedPaketObj.nama + " dipilih. Total harga otomatis diset ke Rp " + this.selectedPaketObj.harga.toLocaleString('id-ID') + ".";
            }
        },

        // Watcher 2: Memantau kata kunci pencarian DO
        searchQuery: function (newVal) {
            if (newVal !== "") {
                this.infoWatcher = "Mencari data Delivery Order dengan kata kunci: '" + newVal + "' (" + this.filteredTrackingList.length + " ditemukan).";
            } else {
                this.infoWatcher = "Menampilkan seluruh data Delivery Order.";
            }
        }
    },

    methods: {
        // mengambil waktu lokal (YYYY-MM-DD) menggunakan fungsi Date()
        setTanggalHariIni: function () {
            var now = new Date();
            var year = now.getFullYear();
            var month = String(now.getMonth() + 1).padStart(2, '0');
            var day = String(now.getDate()).padStart(2, '0');
            this.formDO.tanggalKirim = year + "-" + month + "-" + day;
        },

        // Menampilkan judul mata kuliah untuk detail isi paket
        getJudulMataKuliah: function (kodeMk) {
            var mk = this.stok.find(function (s) { return s.kode === kodeMk; });
            return mk ? mk.judul : "Bahan Ajar UT";
        },

        validasiDO: function () {
            this.errors = {};
            if (!this.formDO.nim) {
                this.errors.nim = "NIM wajib diisi.";
            } else if (!/^\d+$/.test(this.formDO.nim)) {
                this.errors.nim = "NIM harus berupa angka.";
            }
            if (!this.formDO.nama) this.errors.nama = "Nama mahasiswa wajib diisi.";
            if (!this.formDO.upbjj) this.errors.upbjj = "UT-Daerah tujuan wajib dipilih.";
            if (!this.formDO.ekspedisi) this.errors.ekspedisi = "Ekspedisi wajib dipilih.";
            if (!this.formDO.kodePaket) this.errors.kodePaket = "Paket bahan ajar wajib dipilih.";
            if (!this.formDO.tanggalKirim) this.errors.tanggalKirim = "Tanggal kirim wajib diisi.";

            return Object.keys(this.errors).length === 0;
        },

        simpanDO: function () {
            if (this.validasiDO()) {
                var noDOBaru = this.generatedNomorDO;
                var now = new Date();
                var waktuSekarang = this.formDO.tanggalKirim + " " +
                    String(now.getHours()).padStart(2, '0') + ":" +
                    String(now.getMinutes()).padStart(2, '0') + ":" +
                    String(now.getSeconds()).padStart(2, '0');

                // Menambahkan DO baru secara reaktif ke dalam objek tracking
                this.$set(this.tracking, noDOBaru, {
                    nim: this.formDO.nim,
                    nama: this.formDO.nama,
                    status: "Diproses / Dikirim",
                    ekspedisi: this.formDO.ekspedisi,
                    tanggalKirim: this.formDO.tanggalKirim,
                    paket: this.formDO.kodePaket,
                    total: this.totalHargaPaket,
                    perjalanan: [
                        {
                            waktu: waktuSekarang,
                            keterangan: "Order dibuat & paket disiapkan untuk pengiriman ke UPBJJ " + this.formDO.upbjj
                        }
                    ]
                });

                this.infoWatcher = "Delivery Order " + noDOBaru + " atas nama " + this.formDO.nama + " berhasil ditambahkan!";

                // Reset form
                this.formDO.nim = "";
                this.formDO.nama = "";
                this.formDO.upbjj = "";
                this.formDO.ekspedisi = "";
                this.formDO.kodePaket = "";
                this.setTanggalHariIni();
            }
        }
    }
});