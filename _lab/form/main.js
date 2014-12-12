$(function() {
	
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

		var customer = {
			name: $('input#name').val(),
			company: $('input#company').val(),
			telephone: $('input#telephone').val(),
			age: $('input#age').val()
		}

		if($dialog.__exist && $dialog.__exist.el){
			//$dialog.__exist.data = customer;
			//el should be the tr
			$dialog.__exist.el.html(generateTRcontent(customer));
			$dialog.__exist.el.data('fields',JSON.stringify(customer));
		}
		else
		{
			var $tr = $('<tr></tr>');
			$tr.data('fields',JSON.stringify(customer));
			$tr.html(generateTRcontent(customer));
			$tr.appendTo($list);
		}
		$dialog.find('a.close').trigger('click');
		e.preventDefault();
	})

	//edit
	$list.on('click','a.edit',function(e){

		e.preventDefault();

		// console.log(e.target);
		// console.log(e.currentTarget);

		var $tr = $(e.target).parent().parent();
		var customer = $tr.data('fields');
		if(customer){
			customer = JSON.parse(customer);
			$dialog.__exist = {
				el: $tr,
				data: customer
			}
			showDialog();
		}
	})

	$list.on('click','a.delete',function(e){
		e.preventDefault();
		var $tr = $(e.target).parent().parent();
		$tr.remove();
	})

	function generateTRcontent(customer){
		var html = [];
		if(customer){
			html.push('<td>' + customer.name + '</td>');
			html.push('<td>' + customer.company + '</td>');
			html.push('<td>' + customer.telephone + '</td>');
			html.push('<td>' + customer.age + '</td>');
			html.push('<td><a href="#" class="edit">Edit</a> <a href="#" class="delete">Delete</a></td>');
		}
		return html.join('');
	}

	function bindForm(customer){
		$('input#name').val(customer.name);
		$('input#company').val(customer.company);
		$('input#telephone').val(customer.telephone);
		$('input#age').val(customer.age);
	}

	function showDialog(){

		if($dialog.__exist){
			bindForm($dialog.__exist.data)
		}	
		else{
			bindForm({
				name:'',
				company:'',
				telephone:'',
				age:''
			});
		}

		$dialog.show();
	}


})