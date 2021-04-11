$(document).ready(function(){
    // Greeting in summary page
    let elmt_greeting = document.getElementById('set-greetings'),
        elmt_btn_link_cancel = document.getElementById('btn-link-cancel'),
        elmt_btn_notes_cancel = document.getElementById('btn_notes_cancel');

    // Global elements
    window.elmt_btn_new_link = document.getElementById('btn_new_link');
    window.elmt_btn_new_notes = document.getElementById('btn_new_notes');
    window.links_form_input = document.querySelector('#links_form');
    window.notes_form_input = document.querySelector('#notes_form');

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
                document.getElementById("url_name").value = "";
                document.getElementById("url_address").value = "";
            }
            else{
                alert("Error occured while saving link!");
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
                document.getElementById("notes_title").value = "";
                document.getElementById("notes").value = "";
            }
            else{
                alert("Error occured while saving notes!");
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
                            alert("Success")
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
                                alert("Success")
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


