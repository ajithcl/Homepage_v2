$(document).ready(function(){
    // Greeting in summary page
    let elmt_greeting         = document.getElementById('set-greetings'),
        elmt_btn_link_cancel  = document.getElementById('btn-link-cancel'),
        elmt_btn_notes_cancel = document.getElementById('btn_notes_cancel'),
        elmt_btn_gmail        = document.getElementById('btn_GMail'),
        elmt_btn_storage_show = document.getElementById('modal_btn_show');

    // Global elements
    window.elmt_btn_new_link  = document.getElementById('btn_new_link');
    window.elmt_btn_new_notes = document.getElementById('btn_new_notes');
    window.links_form_input   = document.querySelector('#links_form');
    window.notes_form_input   = document.querySelector('#notes_form');
    window.btn_nav_search     = document.querySelector('#btn_nav_search');
    window.txt_nav_search     = document.querySelector('#nav_search_textbox');

    if (elmt_greeting != null){
        let time = new Date();
        let greeting="";
        time = time.getHours();
        if (time < 12) {
        greeting = "Good Morning ";
        } else if (time >= 12 && time < 15) {
        greeting = "Good Afternoon ";
        }
        else if (time >= 15 && time < 20) {
        greeting = "Good Evening"
        }
        else { greeting = "Greetings " }
        elmt_greeting.appendChild(document.createTextNode(greeting));
    }

    initialize();

    // Adding event listeners
    window.elmt_btn_new_link.addEventListener('click', new_link_clicked);
    elmt_btn_link_cancel.addEventListener('click', cancel_link_clicked);
    window.elmt_btn_new_notes.addEventListener('click', new_notes_clicked);
    elmt_btn_notes_cancel.addEventListener('click', cancel_notes_clicked);
    window.btn_nav_search.addEventListener('click',btn_nav_search_clicked);
    elmt_btn_gmail.addEventListener('click', btn_get_gmail_clicked);
    elmt_btn_storage_show.addEventListener('click', btn_storage_show_clicked);

    //getDatascienceRemainingDays();
    getLifeDays();
    getQuote();

    //Links form submit event
    $(document).on('submit', '#links_form', function (e){
        e.preventDefault();

        var form_data = $(this).serialize();
        $.ajax({
            url: '/savelink',
            type: 'POST',
            data: form_data,
            success: function (res){
            if (res =="success"){
                success_message = document.getElementById('links_success_message_id');
                success_message.hidden=false;

                document.getElementById("url_name").value = "";
                document.getElementById("url_address").value = "";

                setTimeout(clearMessage, 3000);
            }
            else{
                error_message = document.getElementById('links_error_message_id');
                error_message.hidden = false;
                setTimeout(clearMessage, 3000);
            }
            }
        })
    })

    //Notes submit event
    $(document).on('submit', '#notes_form', function(e){
        e.preventDefault();
        var form_data = $(this).serialize();
        $.ajax({
            url: '/savenotes',
            type: 'POST',
            data: form_data,
            success: function (res){
            if (res =="success"){
                success_message = document.getElementById("notes_success_message_id");
                success_message.hidden=false;

                document.getElementById("notes_title").value = "";
                document.getElementById("notes").value = "";

                setTimeout(clearMessage, 3000);
            }
            else{
                error_message = document.getElementById('notes_error_message_id');
                error_message.hidden = false;

                setTimeout(clearMessage, 3000);
            }
            }
        })
    })

    //Double click --> Delete event for notes card
    notes_cards_block = document.getElementById("notes_cards_block");
    if (notes_cards_block != null){
        notes_cards_block.addEventListener('dblclick',function(e){
            if(e.target.parentElement.className == 'card-body'){
                let row_id = e.target.parentElement.parentElement.getAttribute("data-rowid");
                form_data = {"_id": row_id}

                if (row_id !=null && confirm("Do you want to delete this notes?")== true){
                    $.ajax({
                        url: '/deletenotes',
                        type: 'POST',
                        data: form_data,
                        success: function (res){
                        if (res =="success"){
                            // alert("Success")
                        }
                        else{
                            alert("Error occured while saving notes!");
                        }
                        }
                    })
                 }
            }
        })
    }

    //Double click for links - delete event
    links_table_body = document.getElementById ("links_table_body");
    if (links_table_body!=null){
        links_table_body.addEventListener('dblclick', function(e){
            if (e.target.parentElement.className=="font-links"){
                link_id = e.target.parentElement.getAttribute("data-id")
                if ((link_id != null || link_id !="") && confirm("Delete link?") == true ){
                    $.ajax({
                        url: '/delete_link',
                        type: 'POST',
                        data: {"_id":link_id},
                        success: function (res){
                            if (res =="success"){
                                // alert("Success");
                            }
                            else{
                                alert("Error occured while saving notes!");
                            }
                        }
                    })
                }
            }
        })
    }
})

// Search button clicked in the navigation bar
// Ref : https://codepen.io/konfuzius/pen/oxBVqR
function btn_nav_search_clicked(){
    txt_search = nav_search_textbox.value.toLowerCase();

    var divs = document.getElementsByClassName("url-name");
    for (var i =0; i < divs.length; i++){
        index = divs[i].innerText.toLowerCase().indexOf(txt_search);
        if (index != -1){
            targetId = divs[i].parentNode.parentNode.parentNode.id;
            document.getElementById(targetId).scrollIntoView();
            break;
        }
    }
}
// Calculate days between birthdate and today
function getLifeDays(){
    life_days = document.querySelector('.life_days');
    dt_birth = new Date(1987, 05,27);
    dt_today = new Date();
    dt_diff = Math.round((dt_today - dt_birth)/86400000);
    life_days.appendChild(document.createTextNode(dt_diff));
}

// Calculate number of days remaining for Data science course completion
function getDatascienceRemainingDays(){
    ds_days = document.querySelector('.ds_days');
    dt_today = new Date();
    dt_target = new Date(2021,00,06);   //hard coded completion date
    if (dt_today << dt_target){
        diff = (dt_target - dt_today)/86400000;  //86400000 converting from milliseconds
        diff = Math.round(diff)
    }else{
        diff = 0;
    }

    ds_days.appendChild(document.createTextNode(diff));

}

//Quote API
function getQuote() {
    quoteAuthor = document.querySelector('.get-author');
    quoteElmt = document.querySelector('.get-quote');
    fetch('https://favqs.com/api/qotd')
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            quoteElmt.appendChild(document.createTextNode(data.quote.body));
            quoteAuthor.appendChild(document.createTextNode(data.quote.author));
        })
        .catch(function (err) {
            console.log(err)
        })
}

//Initilize the page contents
function initialize(){
    window.links_form_input.style.display = 'none';
    window.notes_form_input.style.display = 'none';

    get_exercise_status();
}

// new link button clicked event
function new_link_clicked(e){
    e.target.hidden = true;
    window.links_form_input.style.display = 'inline';
}

// Cancel button for new link form
function cancel_link_clicked(e){
    e.preventDefault();
    window.links_form_input.style.display  = 'none';
    window.elmt_btn_new_link.hidden = false;
}

//New notes button click
function new_notes_clicked(e){
    e.target.hidden = true;
    window.notes_form_input.style.display = 'inline';
}

function cancel_notes_clicked(e){
    e.preventDefault();
    window.notes_form_input.style.display = 'none';
    window.elmt_btn_new_notes.hidden = false;
}

function add_link_count(link_name){
     $.ajax({
            url: '/update_link_count',
            type: 'POST',
            data: {"link_name": link_name},
            success: function (res){
            }
        })
}


// Below function will triggered after user clicks the show button of the
// directory size details - modal form

function btn_storage_show_clicked(e){
    e.preventDefault();
    directory_value = document.getElementById('modal_directory_path');
    console.log (directory_value.value);
    //TODO
    $.ajax({
        url :'./get_directory_storage_details',
        type : 'GET',
        data : {path:directory_value.value},
        success : function (response){
            console.log(response)
        },
        error : function (xhr){
            alert("Error");
        }
    });
}

function btn_get_gmail_clicked(e){
    e.preventDefault();

    // Show the progress spinner
    elmt_mail_spinner = document.getElementById('mail_spinner_div');
    elmt_mail_spinner.removeAttribute('hidden');

    $.ajax({
        url: '/GetGMail',
        type: 'GET',
        success: function(result){

            if (result == null){
                // Hide the progress spinner
                elmt_mail_spinner.setAttribute('hidden','true');
                alert("Unable to access mails");
                return;
            }
            else if (result.startsWith("error:")){
                // Hide the progress spinner
                elmt_mail_spinner.setAttribute('hidden','true');
                alert(result.substring(6));
                return;
            }
            // console.log(typeof(result));
            // console.log(result);
            try{
                    const mail_data = JSON.parse(result);
                    table_body_html="";

                    mail_data.forEach(function(item){
                        /*
                        console.log(item.Subject);
                        console.log(item.From);
                        console.log(item.Date);
                        */
                        table_body_html+=`
                            <tr>
                            <td>${item.Date}</td>
                            <td>${item.From}</td>
                            <td>${item.Subject}</td>
                            </tr>`
                    })

                    // Show the mail table
                    elmt_gmail_table=document.getElementById('GmailTableId');
                    elmt_gmail_table.removeAttribute('hidden');
                    elmt_table_body = document.getElementById('gmail_body');

                    // Hide the progress spinner
                    elmt_mail_spinner.setAttribute('hidden','true');
                    elmt_table_body.innerHTML = table_body_html;
            }
            catch (err){
                // Hide the progress spinner
                elmt_mail_spinner.setAttribute('hidden','true');
                alert("Error while parsing the mail contents.")
                }
        }
    })
}

// Get the exercise status
function get_exercise_status(){
    $.ajax({
        url:'/get_exercise_status',
        type: 'GET',
        success: function(res){
            exercise_btn = document.getElementById("exercise_btn_status");
            exercise_btn.innerText="?";
            if(res=='True'){
                exercise_btn.innerText="Yes";
            }else if (res=='False'){
                exercise_btn.innerText="No";
            }
        }
    })
}

//update exercise status
function update_exercise_status(){
    exercise_btn = document.getElementById("exercise_btn_status");
    btn_value=exercise_btn.innerText;
    if (btn_value=="" ||btn_value=="?"){
        btn_value="No"
    }
    bool_value=!(btn_value=='Yes');
    $.ajax({
        url:'/update_exercise_status',
        type: 'POST',
        data:{'value':bool_value},
        success: function(res){
            if (res=="success"){
                if (bool_value){
                    exercise_btn.innerText='Yes';
                    }
                else{
                    exercise_btn.innerText='No';
                }
            }
            else{
                exercise_btn.innerText=""
            }
        }
    })
}

function clearMessage(){
    success_message=document.getElementById('links_success_message_id');
    success_message.hidden = true;

    error_message = document.getElementById('links_error_message_id');
    error_message.hidden = true;

    success_message = document.getElementById("notes_success_message_id");
    success_message.hidden=true;

    error_message = document.getElementById('notes_error_message_id');
    error_message.hidden = true;
}


