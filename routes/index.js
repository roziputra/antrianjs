var express = require('express');
var session = require('express-session');
var crypto = require('crypto');

var router = express.Router();
var model = require('../db');

const secret = 'rahasia';

var lanjut = true;

var speaker = false;

var io = require('socket.io');
router.io = io();

router.use(session({
	resave: false, // don't save session if unmodified
	saveUninitialized: false, // don't create session until something stored
	secret: 'rahasia'
}));
router.use(function (req, res, next) {
	var err = req.session.error;
	var msg = req.session.success;
	var well = req.session.well;
	delete req.session.error;
	delete req.session.success;
	res.locals.message = '';
	res.locals.well = '';
	if (well) res.locals.well = well;
	if (err) res.locals.message = err;
	if (msg) res.locals.message = msg;
	next();
});
function role(...akses) {
	return function (req, res, next) {
		var hak = akses.some(el => el == req.session.user.tipe);
		if (hak) {
			next();
		} else {
			res.render('login');
		}
	}
}
function restrict(req, res, next) {
	res.locals.reflogin = req.originalUrl;
	if (req.session.user) {
		next();
	} else {
		res.render('login');
	}
}

/* GET home page. */

router.get('/pass', function (req, res, next) {
	var passwordhash = crypto.createHmac('sha256', secret).update('admin').digest('hex');
	res.send(passwordhash);
});

router.get('/setup', function (req, res, next) {
	model.setup(async function () {
		var passwordhash = await crypto.createHmac('sha256', secret).update('admin').digest('hex');
		model.tambah_admin('admin', passwordhash, 'Administrator', 'admin', function (err, row) {
			res.send(passwordhash);
		});
	});
});

router.get('/cetak', async function (req, res, next) {
	var cetak = await new Promise(resolve => {
		model.list_antrian_cetak(function (err, row) {
			if (err) {
				resolve(0);
			} else {
				resolve(row.no_antrian);
			}
		})
	})
	model.list_loket(function (err, row) {
		if (err) {
			res.render('cetak', {
				no_antrian: cetak,
				loket: row,
			});
		} else {
			res.render('cetak', {
				no_antrian: cetak,
				loket: row,
			});
		}
	});
});

router.get('/antrian/tambah/:nomor/:loket', function (req, res, next) {
	var nomor = parseInt(req.params.nomor);
	var loket = parseInt(req.params.loket);
	model.tambah_antrian(nomor, loket, function (err, row) {
		if (err) {
			res.json({ nomor: nomor });
		} else {
			res.json({ nomor: nomor + 1 });
		}
	});
});

router.get('/cetak_antrian/:nomor/:loket', function (req, res, next) {
	var nomor = parseInt(req.params.nomor);
	var loket = req.params.loket;
	res.render('cetak_antrian', {
		no_antrian: nomor,
		loket: loket,
	});
});

router.get('/screen', function (req, res, next) {
	model.list_loket(function (err, row) {
		res.render('screen', {
			pages: 'screen',
			loket: row,
		});
	});
});

router.get('/speaker', function (req, res, next) {
	res.render('speaker');
});

router.get('/login', function (req, res) {
	res.redirect('/');
});

router.post('/login', async function (req, res) {
	res.locals.reflogin = req.body.reflogin;
	var username = req.body.username;
	var passwordhash = await crypto.createHmac('sha256', secret).update(req.body.password).digest('hex');
	model.auth(username, passwordhash, function (err, user) {
		if (user) {
			// Regenerate session when signing in
			// to prevent fixation

			req.session.regenerate(function () {
				// Store the user's primary key
				// in the session store to be retrieved,
				// or in this case the entire user object
				req.session.user = user;
				req.session.well = 'Selamat datang di Aplikasi Antrian Dukcapil Kabupaten Aceh Barat Daya';
				res.redirect(req.body.reflogin);
			});
		} else {
			req.session.error = 'Gagal Login, koreksi username dan password anda !';
			res.redirect(req.body.reflogin);
		}
	});
});

router.get('/user/logout', function (req, res) {
	// destroy the user's session to log them out
	// will be re-created next request
	req.session.destroy(function () {
		res.redirect('/');
	});
});

router.get('/', restrict, async function (req, res, next) {
	delete req.session.well;
	var antrian = await new Promise(resolve => {
		model.list_antrian(function (err, row) {
			resolve(row);
		})
	})
	var sudah = antrian.filter(x => x.status == 1);
	var belum = antrian.filter(x => x.status == 0);

	res.render('dashboard', {
		pages: 'dashboard',
		user: req.session.user,
		antrian: antrian.length,
		sudah: sudah.length,
		belum: belum.length,
	});
});

router.get('/dashboard', restrict, async function (req, res, next) {
	delete req.session.well;
	var antrian = await new Promise(resolve => {
		model.list_antrian(function (err, row) {
			resolve(row);
		})
	})
	var sudah = antrian.filter(x => x.status == 1);
	var belum = antrian.filter(x => x.status == 0);

	res.render('dashboard', {
		pages: 'dashboard',
		user: req.session.user,
		antrian: antrian.length,
		sudah: sudah.length,
		belum: belum.length,
	});
});

router.get('/antrian/reset', restrict, role('admin'), function (req, res, next) {
	model.reset_antrian(function (err, row) {
		if (err) {
			req.session.error = 'Gagal reset antrian!';
			router.io.emit('reload dashboard', { antrian: 0, sudah: 0, belum: 0 });
			router.io.emit('reload cetak', 1);
			router.io.emit('reload screen');
			res.redirect('/loket');
		} else {
			req.session.error = 'Berhasil reset antrian!';
			router.io.emit('reload dashboard', { antrian: 0, sudah: 0, belum: 0 });
			router.io.emit('reload cetak', 0);
			router.io.emit('reload screen');
			res.redirect('/loket');
		}
	});

});

router.get('/loket', restrict, role('admin'), function (req, res, next) {
	model.list_loket(function (err, row) {
		if (err) {
			res.render('loket', {
				pages: 'loket',
				user: req.session.user,
				row: row,
				error: err
			});
		} else {
			res.render('loket', {
				pages: 'loket',
				user: req.session.user,
				row: row
			});
		}
	});
});

router.get('/loket/antrian', restrict, role('operator'), function (req, res, next) {
	model.get_loket_user(req.session.user.username, function (err, row) {
		if (err) {
			res.render('loket/antrian', {
				pages: 'loket',
				user: req.session.user,
				loket: row,
				error: err
			});
		} else {
			res.render('loket/antrian', {
				pages: 'loket',
				user: req.session.user,
				loket: row
			});
		}
	});
});

router.get('/antrian/lanjut/:loket', restrict, role('operator'), async function (req, res, next) {
	var loket = req.params.loket;
	var antrian = await new Promise(resolve => {
		model.get_antrian(loket, function (err, row) {
			resolve(row);
		})
	})

	if (!lanjut) {
		req.session.error = 'mohon tunggu!';
		res.redirect('/loket/antrian');
	} else if (antrian == undefined) {
		req.session.error = 'Tidak ada antrian saat ini!';
		res.redirect('/loket/antrian');
	} else {
		var loket = req.params.loket;
		model.edit_antrian(antrian.no_antrian, loket, function (err, row) {
			if (err) {
				req.session.error = 'gagal lanjutkan antrian!';
				res.redirect('/loket/antrian');
			} else {
				lanjut = false;
				model.list_antrian(function (err, row) {
					var sudah = row.filter(x => x.status == 1);
					var belum = row.filter(x => x.status == 0);
					router.io.emit('panggil', { antrian: antrian.no_antrian.toString(), loket: loket.toString() });
					router.io.emit('reload dashboard', { antrian: row.length, sudah: sudah.length, belum: belum.length });
					req.session.success = 'Sedang memanggil!';
					res.redirect('/loket/antrian');
				})
			}
		});
	}
});

router.get('/loket/tambah', restrict, role('admin'), function (req, res, next) {
	var user_loket = model.list_user_loket(function (err, row) {
		if (err) {
			res.render('loket/tambah', {
				pages: 'loket',
				user: req.session.user,
				user_loket: []
			});
		} else {
			res.render('loket/tambah', {
				pages: 'loket',
				user: req.session.user,
				user_loket: row
			});
		}
	});

});

router.post('/loket/tambah', restrict, role('admin'), function (req, res, next) {
	var kode = req.body.kode;
	var nama = req.body.nama;
	var user = req.body.user;
	model.tambah_loket(kode, nama, user, function (err, row) {
		if (err) {
			req.session.error = 'Gagal menambah loket!';
			res.redirect('back');
		} else {
			req.session.success = 'Berhasil menambah loket!';
			res.redirect('/loket');
		}
	});
});

router.get('/loket/edit/:loket', restrict, role('admin'), async function (req, res, next) {
	var loket = req.params.loket;

	var user_loket = await new Promise(resolve => {
		model.list_user_loket(function (err, row) {
			resolve(row);
		})
	})

	model.get_loket(loket, function (err, row) {
		if (err) {
			req.session.error = 'tidak ada loket ' + loket;
			res.redirect('/loket');
		} else {
			res.render('loket/edit', {
				pages: 'loket',
				user: req.session.user,
				user_loket: user_loket,
				loket: row
			});
		}
	});
});

router.post('/loket/edit', restrict, role('admin'), function (req, res, next) {
	var kode = req.body.kode;
	var nama = req.body.nama;
	var user = req.body.user;
	model.edit_loket(kode, nama, user, function (err, row) {
		if (err) {
			req.session.error = 'Gagal edit loket ' + kode;
			res.redirect('back');
		} else {
			req.session.success = 'Berhasil edit loket ' + kode;
			res.redirect('/loket');
		}
	});
});

router.get('/loket/hapus/:loket', restrict, role('admin'), function (req, res, next) {
	var loket = req.params.loket;
	model.hapus_loket(loket, function (err, row) {
		if (err) {
			req.session.error = err;
			res.redirect('back');
		} else {
			req.session.success = 'Berhasil menghapus loket ' + loket;
			res.redirect('/loket');
		}
	});
});

router.get('/user', restrict, role('admin'), function (req, res, next) {
	model.list_user(function (err, row) {
		if (err) {
			res.render('user', {
				pages: 'user',
				user: req.session.user,
				row: row,
				error: err
			});
		} else {
			res.render('user', {
				pages: 'user',
				user: req.session.user,
				row: row
			});
		}
	});
});

router.get('/user/tambah', restrict, role('admin'), function (req, res, next) {
	res.render('user/tambah', {
		pages: 'user',
		user: req.session.user,
	});
});

router.post('/user/tambah', restrict, role('admin'), async function (req, res, next) {
	var username = req.body.username;
	var passwordhash = await crypto.createHmac('sha256', secret).update(req.body.password).digest('hex');
	var nama = req.body.nama;
	model.tambah_user(username, passwordhash, nama, function (err, row) {
		if (err) {
			req.session.error = 'Gagal menambah pengguna!';
			res.redirect('back');
		} else {
			req.session.success = 'Berhasil menambah pengguna!';
			res.redirect('/user');
		}
	});
});

router.get('/user/hapus/:username', restrict, role('admin'), function (req, res, next) {
	model.hapus_user(req.params.username, function (err, row) {
		if (err) {
			req.session.error = err;
			res.redirect('/user');
		} else {
			req.session.success = 'Berhasil menghapus pengguna!';
			res.redirect('/user');
		}
	});
});

router.io.on('connection', function (socket) {
	let speakerServer;
	socket.on('reload cetak', (data) => {
		socket.emit('reload cetak', data);
		model.list_antrian(function (err, row) {
			var sudah = row.filter(x => x.status == 1);
			var belum = row.filter(x => x.status == 0);
			router.io.emit('reload dashboard', { antrian: row.length, sudah: sudah.length, belum: belum.length });
		})
	})

	socket.on('lanjut', () => {
		lanjut = true;
		socket.broadcast.emit('lanjut');
	})
	socket.on('panggil', (data) => {
		lanjut = false;

		if (!speaker) {
			lanjut = true;
			socket.emit('speaker');
			return;
		}
		socket.broadcast.emit('panggil', data);
	})

	socket.on('start-speaker', function (socket) {
		speaker = true;
		speakerServer = socket;
	})

	socket.on("disconnect", () => {
		if (socket.id == speakerServer) {
			speakerServer = null;
			speaker = false;
		}
	});
});

module.exports = router;