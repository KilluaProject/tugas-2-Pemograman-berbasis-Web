var app = new Vue({
    el: '#app',
    data: {
        // Data utama dari dataBahanAjar.js
        upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
        kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
        stok: [
            {
                kode: "EKMA4116",
                judul: "Pengantar Manajemen",
                kategori: "MK Wajib",
                upbjj: "Jakarta",
                lokasiRak: "R1-A3",
                harga: 65000,
                qty: 28,
                safety: 20,
                catatanHTML: "<em>Edisi 2024, cetak ulang</em>"
            },
            {
                kode: "EKMA4115",
                judul: "Pengantar Akuntansi",
                kategori: "MK Wajib",
                upbjj: "Jakarta",
                lokasiRak: "R1-A4",
                harga: 60000,
                qty: 7,
                safety: 15,
                catatanHTML: "<strong>Cover baru</strong>"
            },
            {
                kode: "BIOL4201",
                judul: "Biologi Umum (Praktikum)",
                kategori: "Praktikum",
                upbjj: "Surabaya",
                lokasiRak: "R3-B2",
                harga: 80000,
                qty: 12,
                safety: 10,
                catatanHTML: "Butuh <u>pendingin</u> untuk kit basah"
            },
            {
                kode: "FISIP4001",
                judul: "Dasar-Dasar Sosiologi",
                kategori: "MK Pilihan",
                upbjj: "Makassar",
                lokasiRak: "R2-C1",
                harga: 55000,
                qty: 2,
                safety: 8,
                catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder"
            }
        ],

        // State untuk Filter & Sort
        selectedUpbjj: "",
        selectedKategori: "",
        filterReorder: false,
        sortBy: "",
        logPesan: "Menampilkan seluruh stok bahan ajar UT.",

        // State untuk Edit Stok (Modal Popup)
        editingKode: null,
        editForm: {
            kode: "",
            judul: "",
            kategori: "",
            upbjj: "",
            harga: 0,
            lokasiRak: "",
            qty: 0,
            safety: 0,
            catatanHTML: ""
        },

        // State untuk Form Tambah Bahan Ajar Baru & Validasi
        newItem: {
            kode: "",
            judul: "",
            kategori: "",
            upbjj: "",
            lokasiRak: "",
            harga: null,
            qty: null,
            safety: null,
            catatanHTML: ""
        },
        errors: {}
    },

    computed: {
        // Dependent Options: Menyesuaikan daftar kategori berdasarkan UT-Daerah yang dipilih
        availableKategori: function () {
            if (!this.selectedUpbjj) {
                return [];
            }
            return this.kategoriList;
        },

        // Computed Property untuk mem-filter dan meng-urutkan data tanpa recompute berlebihan
        filteredAndSortedStok: function () {
            var hasil = this.stok.slice();

            // 1. Filter berdasarkan UT-Daerah
            if (this.selectedUpbjj !== "") {
                var upbjj = this.selectedUpbjj;
                hasil = hasil.filter(function (item) {
                    return item.upbjj === upbjj;
                });
            }

            // 2. Filter berdasarkan Kategori Mata Kuliah (Dependent pada UT-Daerah)
            if (this.selectedUpbjj !== "" && this.selectedKategori !== "") {
                var kat = this.selectedKategori;
                hasil = hasil.filter(function (item) {
                    return item.kategori === kat;
                });
            }

            // 3. Filter Re-order (qty < safety atau qty === 0)
            if (this.filterReorder) {
                hasil = hasil.filter(function (item) {
                    return item.qty < item.safety || item.qty === 0;
                });
            }

            // 4. Sort berdasarkan judul, stock (qty), dan harga
            if (this.sortBy === "judul-asc") {
                hasil.sort(function (a, b) { return a.judul.localeCompare(b.judul); });
            } else if (this.sortBy === "judul-desc") {
                hasil.sort(function (a, b) { return b.judul.localeCompare(a.judul); });
            } else if (this.sortBy === "qty-asc") {
                hasil.sort(function (a, b) { return a.qty - b.qty; });
            } else if (this.sortBy === "qty-desc") {
                hasil.sort(function (a, b) { return b.qty - a.qty; });
            } else if (this.sortBy === "harga-asc") {
                hasil.sort(function (a, b) { return a.harga - b.harga; });
            } else if (this.sortBy === "harga-desc") {
                hasil.sort(function (a, b) { return b.harga - a.harga; });
            }

            return hasil;
        }
    },

    watch: {
        // Watcher 1: Memantau perubahan pilihan UT-Daerah (Reset kategori otomatis saat UPBJJ berubah)
        selectedUpbjj: function (newVal, oldVal) {
            this.selectedKategori = "";
            if (newVal === "") {
                this.logPesan = "Filter UT-Daerah direset. Menampilkan seluruh daerah.";
            } else {
                this.logPesan = "Memfilter stok untuk UT-Daerah: " + newVal + ". Silakan pilih filter Kategori Mata Kuliah.";
            }
        },

        // Watcher 2: Memantau pengaktifan mode filter Re-order
        filterReorder: function (newVal) {
            if (newVal) {
                this.logPesan = "Perhatian: Menampilkan daftar bahan ajar yang menipis atau kosong (wajib segera Re-order).";
            } else {
                this.logPesan = "Filter Re-order dinonaktifkan.";
            }
        }
    },

    methods: {
        resetFilter: function () {
            this.selectedUpbjj = "";
            this.selectedKategori = "";
            this.filterReorder = false;
            this.sortBy = "";
            this.logPesan = "Seluruh filter dan urutan telah di-reset ke pengaturan awal.";
        },

        mulaiEdit: function (item) {
            this.editingKode = item.kode;
            this.editForm = {
                kode: item.kode,
                judul: item.judul,
                kategori: item.kategori,
                upbjj: item.upbjj,
                harga: item.harga,
                lokasiRak: item.lokasiRak,
                qty: item.qty,
                safety: item.safety,
                catatanHTML: item.catatanHTML
            };
        },

        simpanEdit: function () {
            if (this.editForm.qty < 0 || this.editForm.safety < 0 || !this.editForm.lokasiRak) {
                alert("Lokasi rak tidak boleh kosong dan jumlah stok/safety tidak boleh negatif!");
                return;
            }
            if (!this.editForm.harga || this.editForm.harga <= 0) {
                alert("Harga bahan ajar harus lebih dari 0!");
                return;
            }
            var target = this.stok.find(function (s) {
                return s.kode === this.editingKode;
            }.bind(this));

            if (target) {
                target.lokasiRak = this.editForm.lokasiRak;
                target.harga = Number(this.editForm.harga);
                target.qty = Number(this.editForm.qty);
                target.safety = Number(this.editForm.safety);
                target.catatanHTML = this.editForm.catatanHTML;
                this.logPesan = "Data stok untuk mata kuliah " + target.kode + " berhasil diperbarui.";
            }
            this.editingKode = null;
        },

        batalEdit: function () {
            this.editingKode = null;
        },

        validasiForm: function () {
            this.errors = {};
            if (!this.newItem.kode) {
                this.errors.kode = "Kode mata kuliah wajib diisi.";
            } else {
                var kodeAda = this.stok.some(function (s) {
                    return s.kode.toUpperCase() === this.newItem.kode.toUpperCase();
                }.bind(this));
                if (kodeAda) {
                    this.errors.kode = "Kode mata kuliah sudah terdaftar.";
                }
            }

            if (!this.newItem.judul) this.errors.judul = "Judul mata kuliah wajib diisi.";
            if (!this.newItem.kategori) this.errors.kategori = "Kategori wajib dipilih.";
            if (!this.newItem.upbjj) this.errors.upbjj = "UT-Daerah wajib dipilih.";
            if (!this.newItem.lokasiRak) this.errors.lokasiRak = "Lokasi rak wajib diisi.";
            if (this.newItem.harga === null || this.newItem.harga <= 0) this.errors.harga = "Harga harus lebih dari 0.";
            if (this.newItem.qty === null || this.newItem.qty < 0) this.errors.qty = "Stok awal minimal 0.";
            if (this.newItem.safety === null || this.newItem.safety <= 0) this.errors.safety = "Safety stock minimal 1.";
            if (!this.newItem.catatanHTML) this.errors.catatanHTML = "Catatan wajib diisi.";

            return Object.keys(this.errors).length === 0;
        },

        tambahBahanAjar: function () {
            if (this.validasiForm()) {
                this.stok.push({
                    kode: this.newItem.kode.toUpperCase(),
                    judul: this.newItem.judul,
                    kategori: this.newItem.kategori,
                    upbjj: this.newItem.upbjj,
                    lokasiRak: this.newItem.lokasiRak,
                    harga: Number(this.newItem.harga),
                    qty: Number(this.newItem.qty),
                    safety: Number(this.newItem.safety),
                    catatanHTML: this.newItem.catatanHTML
                });

                this.logPesan = "Bahan ajar baru (" + this.newItem.kode.toUpperCase() + ") berhasil ditambahkan!";

                // Reset form setelah berhasil disimpan
                this.newItem = {
                    kode: "",
                    judul: "",
                    kategori: "",
                    upbjj: "",
                    lokasiRak: "",
                    harga: null,
                    qty: null,
                    safety: null,
                    catatanHTML: ""
                };
            }
        }
    }
});