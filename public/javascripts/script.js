$(function(){
	var socket = io();

	String.prototype.terbilang = function() {
		var bilangan = ['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
		var angka = parseInt(this);

		if (angka < 12) {
			return bilangan[angka];
		}
		else if (angka < 20) {
			return bilangan[angka-10]+ ' belas';
		}
		else if (angka < 100) {
			var utama = angka/10;
			var depan = parseInt(utama);
			var belakang = angka%10;
			return bilangan[depan]+' puluh '+belakang.toString().terbilang();
		} else if (angka < 1000) {
			var utama = angka/100;
			var depan = parseInt(utama);
			var belakang = angka%100;
			if (depan==1)
				return ' seratus ' + belakang.toString().terbilang();
			else
				return bilangan[depan]+' ratus ' + belakang.toString().terbilang();
		} else {
			return 'seribu';
		}
	};
	/*
	$.fn.datepicker.dates['id'] = {
        days: ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
        daysShort: ["Ahd", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
        daysMin: ["Ah", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"],
        months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
        monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
        today: "Hari ini",
        clear: "Kosongkan",
    };
	$.fn.datepicker.defaults.format = "yyyy-mm-dd";
	$.fn.datepicker.defaults.autoclose = true;
	$.fn.datepicker.defaults.language = "id";
	*/
	$.fn.validasi = function() {
		var inputObj = $(this);
		inputObj.siblings('.alert').remove();
		
		if (inputObj[0].checkValidity()) {
			return true;
		} else {
			inputObj.after(function() {
				//console.log(this);
				//inputObj[0].validationMessage
				return '<div class="alert alert-danger alert-dismissible fade in" role="alert" style="margin-top:4px;margin-bottom:0;">' +
					   '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + 
					   '<i class="fa fa-fw fa-info"></i>' + inputObj[0].title + '<p>' + '</p></div>';
			});
			$(this).focus();
			return false;
		}
	}
	$('.dropdown').on('show.bs.dropdown', function() {
		$(this).find('.dropdown-menu').first().stop(true, true).fadeIn();
	});

	// Add slideUp animation to Bootstrap dropdown when collapsing.
	$('.dropdown').on('hide.bs.dropdown', function() {
		$(this).find('.dropdown-menu').first().stop(true, true).fadeOut();
	});
	$('.btn-konfirm').click(function(e) {
		e.preventDefault();

		var thisref = this.href;
		var isi = $(this).data('content');
		if (isi==undefined) isi = $(this).attr('title');

		if ($(this).attr('disabled')== true) {
            e.stopPropagation()
        } else {
        	$('#myModal .modal-body').html(isi);
            $('#myModal').modal('show');
        }
		$('.btn-ok').click(function() {
			window.location.href = thisref;
		});
		return false;
	});
	
	/*
	$.extend( true, $.fn.dataTable.defaults, {
		"bLengthChange": false,
		"iDisplayLength": 50,
		"bStateSave": true,
		"deferRender": true,
		"processing": true,
		"oLanguage": {
			"sLoadingRecords": "&nbsp;",
			"sProcessing": "<span class='text-info text-bold'><h1><i class='fa fa-refresh fa-spin'></i></h1></span>",
			"sLengthMenu": "Lihat _MENU_ baris per halaman",
			"sSearch": "Pencarian : ",
			"sZeroRecords": "Tidak ditemukan - Maaf!",
			"sInfo": "_START_ sampai _END_ dari _TOTAL_ ",
			"sInfoEmpty": "tidak ada data",
			"sInfoFiltered": "(dari _MAX_)",
			"oPaginate": {
				"sFirst": "&lsaquo; Pertama",
				"sLast": "Terakhir &rsaquo;",
				"sNext": "&rsaquo;",
				"sPrevious": "&lsaquo;",
			}
		}
	} );
	$('.data-table').DataTable({
		"bLengthChange": true,
		"iDisplayLength": 50,
		"bStateSave": true,
		"oLanguage": {
            "sLengthMenu": "Lihat _MENU_ baris per halaman",
			"sSearch": "Pencarian : ",
            "sZeroRecords": "Tidak ditemukan - Maaf!",
            "sInfo": "_START_ sampai _END_ dari _TOTAL_ ",
            "sInfoEmpty": "Showing 0 to 0 of 0 records",
            "sInfoFiltered": "(dari _MAX_)",
			"oPaginate": {
				"sFirst": "&lsaquo; Pertama",
				"sLast": "Terakhir &rsaquo;",
				"sNext": "&rsaquo;",
				"sPrevious": "&lsaquo;",
			}
        }
	});
	$('.select2').select2({ width: '100%' });
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();
	$('.tanggal').datepicker({
      autoclose: true,
	  language: 'id',
	  format: 'yyyy-mm-dd',
	  startDate: '2000-01-01',
	  clearBtn: true,
	  title: 'Pilih Tanggal',
	  todayBtn: true,
    });
	$('.tahun').datepicker({
		autoclose: true,
		language: 'id',
		format: 'yyyy',
		startView: 2,
		minViewMode: 2,
		maxViewMode: 2
    });
    */
	var bulan = [
		'Januari',
		'Februari',
		'Maret',
		'April',
		'Mei',
		'Juni',
		'Juli',
		'Agustus',
		'September',
		'Oktober',
		'November',
		'Desember'
	];
	var hari = [
		'Ahad',
		'Senin',
		'Selasa',
		'Rabu',
		'Kamis',
		'Jumat',
		'Sabtu',
	];
	setInterval(function(){
		var waktu = $('ul.sidebar-menu > li.header');
		var d = new Date();
		waktu.text(function(){
			return hari[d.getDay()]+', '+d.getDate()+' '+bulan[d.getMonth()]+' '+d.getFullYear()+' - '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2);
		});
	}, 500);
});