window.indexedDB = window.indexedDB || window.mozIndexedDB  || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
window.IDBCursor = window.IDBCursor || window.webkitIDBCursor;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

$(function() {
	
	function initDatabase(db){

		if(db.objectStoreNames.contains('customers')){
			return;
		}

		db.createObjectStore("customers",{
			keyPath: 'id',
			autoIncrement:true
		});
	}

	//open
	var request = indexedDB.open('MyCustomer',1);
	var db = null;

	request.onsuccess = function(e){
		db = request.result;
		refreshList();
	}

	request.onupgradeneeded = function(e){
		db = request.result;
		initDatabase(db);
	}



	var $dialog = $('#new_form');
	var $list = $('#list');

	$('#add_new').click(function(){
		$dialog.__exist = null;
		showDialog();
	})

	//close the dialog
	$dialog.find('a.close').click(function(e){
		$dialog.hide();
		e.preventDefault();
	})


	//submit click
	$dialog.find('form').on('submit',function(e){

		e.preventDefault();

		var customer = {
			id:parseInt($('input#_id').val()),
			name: $('input#name').val(),
			company: $('input#company').val(),
			telephone: $('input#telephone').val(),
			age: $('input#age').val()
		}

		if(customer.id){
			var trans = db.transaction(['customers'],'readwrite');
			var customerObjectStore = trans.objectStore('customers');
			customerObjectStore.put(customer).onsuccess = function(e){
				refreshList(e.target.transaction);
				$dialog.find('a.close').trigger('click');
			}
		}
		else{
			customer = {
				name:customer.name,
				company:customer.company,
				telephone:customer.telephone,
				age:customer.age
			}

			//insert into indexedDB
			var trans = db.transaction(['customers'],'readwrite');
			var customerObjectStore = trans.objectStore('customers');
			customerObjectStore.add(customer).onsuccess = function(e){
				refreshList(e.target.transaction);
				$dialog.find('a.close').trigger('click');
			}
		}

	})

	//edit
	$list.on('click','a.edit',function(e){

		e.preventDefault();

		// console.log(e.target);
		// console.log(e.currentTarget);

		// var $tr = $(e.target).parent().parent();
		// var customer = $tr.data('fields');
		// if(customer){
		// 	customer = JSON.parse(customer);
		// 	$dialog.__exist = {
		// 		el: $tr,
		// 		data: customer
		// 	}
		// 	showDialog();
		// }
		showDialog($(this).data('id'));

	})

	$list.on('click','a.delete',function(e){
		e.preventDefault();
		// var $tr = $(e.target).parent().parent();
		// $tr.remove();

		var $this = $(this);
		var id = parseInt($this.data('id'));

		var trans = db.transaction(['customers'],'readwrite');
		var customerObjectStore = trans.objectStore('customers');
		customerObjectStore.delete(id).onsuccess = function(e){
			refreshList(e.target.transaction);
		}
		
	})

	function refreshList(trans){
		var _trans = trans || db.transaction(['customers'],'readonly');
		var customerObjectStore = _trans.objectStore('customers');

		$list.empty();

		customerObjectStore.openCursor().onsuccess = function(e){
			//IDBCursor
			var cursor = e.target.result;
			if (cursor) {  
				var customer = cursor.value;
				console.log(customer);
				var $tr = $('<tr></tr>');
				$tr.html(generateTRcontent(customer));
				$tr.appendTo($list);
				cursor.continue();
		    }
		}
	}

	function generateTRcontent(customer){
		var html = [];
		if(customer){
			html.push('<td>' + customer.name + '</td>');
			html.push('<td>' + customer.company + '</td>');
			html.push('<td>' + customer.telephone + '</td>');
			html.push('<td>' + customer.age + '</td>');
			html.push('<td><a href="#" data-id="' + customer.id + '" class="edit">Edit</a> <a href="#" data-id="' + customer.id + '" class="delete">Delete</a></td>');
		}
		return html.join('');
	}

	function bindForm(customer){
		$('input#_id').val(customer.id);
		$('input#name').val(customer.name);
		$('input#company').val(customer.company);
		$('input#telephone').val(customer.telephone);
		$('input#age').val(customer.age);
	}

	function showDialog(id){

		// if($dialog.__exist){
		// 	bindForm($dialog.__exist.data)
		// }	
		// else{
		// 	bindForm({
		// 		name:'',
		// 		company:'',
		// 		telephone:'',
		// 		age:''
		// 	});
		// }

		if(id){
			var trans = db.transaction(['customers'],'readonly');
			var customerObjectStore = trans.objectStore('customers');

			var boundKeyOnly = IDBKeyRange.only(id);
			customerObjectStore.openCursor(boundKeyOnly).onsuccess = function(e){
				var cursor = e.target.result;
				if(cursor){
					bindForm(cursor.value);
					cursor.continue;
				}
			}
		}
		else{
			bindForm({
				id:'',
				name:'',
				company:'',
				telephone:'',
				age:''
			});
		}

		$dialog.show();
	}


})