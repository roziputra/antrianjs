var sqlite3 = require('sqlite3').verbose();
var path = require('path');

const dbFile = path.resolve(__dirname, 'antrianjs.db').replace('\app.asar', '');
const db = new sqlite3.Database(dbFile, sqlite3.OPE)


exports.setup = function () {
	db.run('create table if not exists user(username varchar(50), password text, nama text, tipe varchar(10))');
	db.run('create table if not exists loket(kode varchar(10), nama text, user varchar(50), antrian int(10), kunci int(1))');
	db.run('create table if not exists antrian(no_antrian int(10), loket varchar(10), status int(1))');
}

exports.auth = function (username, password, cb) {
	db.get('select * from user where username=? and password=?', username, password, function (err, result) {
		if (err) return cb(err);
		if (result) return cb(null, result);
		else return cb('username dan password anda salah');
	});
}

exports.list_loket = function (cb) {
	db.all('select l.kode, l.nama, l.user, l.antrian, u.nama operator from loket l left outer join user u on l.user = u.username', function (err, result) {
		if (err) return cb(err, result);
		if (result.length) return cb(null, result);
		else return cb('tidak ada data', result);
	});
}

exports.get_loket = function (kode, cb) {
	db.get('select l.kode, l.nama, l.user from loket l where kode = $kode', { $kode: kode }, function (err, result) {
		if (err) return cb(err, result);
		if (result) return cb(null, result);
		else return cb('tidak ada data', result);
	});
}

exports.get_loket_user = function (user, cb) {
	db.get('select l.kode, l.nama, l.user, l.antrian, u.nama operator from loket l left outer join user u on l.user = u.username where l.user = $user', { $user: user }, function (err, result) {
		if (err) return cb(err, result);
		if (result) return cb(null, result);
		else return cb('tidak ada data', result);
	});
}

exports.tambah_loket = function (kode, nama, username, cb) {
	db.run('insert into loket values ($kode, $nama, $username, 0, 0)', { $kode: kode, $nama: nama, $username: username }, function (err) {
		if (err) return cb(err);
		if (this.lastID) return cb(null, this.lastID);
		else return cb('gagal tambah loket');
	});
}

exports.edit_loket = function (kode, nama, user, cb) {
	db.run('update loket set nama = $nama, user = $user where kode = $kode', { $kode: kode, $nama: nama, $user: user }, function (err) {
		if (err) return cb(err);
		if (this.changes) return cb(null, this.changes);
		else return cb('tidak ada loket yang diedit');
	});
}

exports.hapus_loket = function (kode, cb) {
	db.run('delete from loket where kode = ?', kode, function (err) {
		if (err) return cb(err);
		if (this.changes) return cb(null, this.changes);
		else return cb('tidak ada loket loket yang dihapus');
	});
}

exports.list_antrian = function (cb) {
	db.all('select * from antrian', function (err, result) {
		if (err) return cb(err);
		if (result.length) return cb(null, result);
		else return cb('tidak ada data', result);
	});
}

exports.get_antrian = function (loket, cb) {
	db.get('select * from antrian where status=0 and loket = ? order by no_antrian asc', loket, function (err, result) {
		if (err) return cb(err);
		if (result) return cb(null, result);
		else return cb('tidak ada data', result);
	});
}

exports.list_antrian_cetak = function (cb) {
	db.get('select * from antrian order by no_antrian desc', function (err, result) {
		if (err) return cb(err);
		if (result) return cb(null, result);
		else return cb('tidak ada data', result);
	});
}

exports.reset_antrian = function (cb) {
	db.run('update loket set antrian = 0', function (err) {
		if (err) return cb(err);
	});
	db.run('delete from antrian', function (err) {
		if (err) return cb(err);
		if (this.changes) return cb(null, this.changes);
		else return cb('tidak ada data yang direset');
	});
}

exports.tambah_antrian = function (nomor, loket, cb) {
	db.run('insert into antrian values (?, ?, 0) ', nomor, loket, function (err) {
		if (err) return cb(err);
		if (this.lastID) cb(null, this.lastID);
		else return cb('gagal tambah antrian');
	});
}

exports.edit_antrian = function (nomor, loket, cb) {
	db.run('update loket set antrian = $nomor where kode = $loket', { $loket: loket, $nomor: nomor }, function (err) {
		if (err) return cb(err);
	});
	db.run('update antrian set loket = $loket, status = 1 where no_antrian = $nomor', { $loket: loket, $nomor: nomor }, function (err) {
		if (err) return cb(err);
		if (this.changes) return cb(null, this.changes);
		else return cb('tidak ada antrian yang diedit');
	});
}

exports.list_user = function (cb) {
	db.all('select * from user where tipe=?', 'operator', function (err, result) {
		if (err) return cb(err, result);
		if (result.length) return cb(null, result);
		else return cb('tidak ada data', result);
	});
}

exports.list_user_loket = function (cb) {
	db.all('select u.username, u.nama from user u left outer join loket l on u.username=l.user where l.kode is null and u.tipe=?', 'operator', function (err, result) {
		if (err) return cb(err, result);
		if (result.length) return cb(null, result);
		else return cb('tidak ada data', result);
	});
}

exports.list_userx = function () {
	return new Promise(resolve => {
		db.all('select * from user where tipe=?', 'operator', function (err, result) {
			resolve(result);
		});
	});
}

exports.tambah_user = function (username, password, nama, cb) {
	db.run('insert into user values ($username, $password, $nama, "operator")', { $username: username, $password: password, $nama: nama }, function (err) {
		if (err) return cb(err);
		if (this.lastID) return cb(null, this.lastID);
		else return cb('gagal tambah pengguna');
	});
}

exports.tambah_admin = function (username, password, nama, tipe) {
	db.run('insert into user values ($username, $password, $nama, $tipe)', { $username: username, $password: password, $nama: nama, $tipe: tipe }, function (err) {
		if (err) return cb(err);
		if (this.lastID) return cb(null, this.lastID);
		else return cb('gagal tambah admin!');
	});
}

exports.hapus_user = function (username, cb) {
	db.run('delete from user where tipe="operator" and username = ?', username, function (err) {
		if (err) return cb('gagal menghapus ' + username);
		if (this.changes) return cb(null, this.changes);
		else return cb('tidak ada data yang dihapus!');
	});
}