var loginApp = new Vue({
    el: '#login-app',
    data: {
        email: '',
        password: '',
        showPassword: false,
        isLoading: false,
        errorMessage: '',
        successMessage: '',
        validCredentials: {
            email: 'admin@ecampus.ut.ac.id',
            password: 'admin123'
        }
    },
    methods: {
        handleLogin: function () {
            this.errorMessage = '';
            this.successMessage = '';
            this.isLoading = true;

            var inputEmail = (this.email || '').trim().toLowerCase();
            var inputPassword = (this.password || '').trim();

            setTimeout(function () {
                if (
                    inputEmail === this.validCredentials.email.toLowerCase() &&
                    inputPassword === this.validCredentials.password
                ) {
                    this.successMessage = 'Login berhasil!';

                    var sessionData = {
                        email: this.validCredentials.email,
                        nama: 'Raden Agung Prakoso Wibowo',
                        role: 'Admin SITTA',
                        loginAt: new Date().toISOString()
                    };
                    localStorage.setItem('sitta_user', JSON.stringify(sessionData));

                    setTimeout(function () {
                        window.location.href = 'index.html';
                    }, 400);
                } else {
                    this.isLoading = false;
                    this.errorMessage = 'Email atau password yang Anda masukkan salah.';
                }
            }.bind(this), 300);
        }
    }
});
