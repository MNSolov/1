const delayRequest = 1000;

const input = document.querySelector( '.input' );

const sendRequest = debounceDecorator( send, delayRequest );

input.addEventListener( 'input', readFromInput );

async function readFromInput() {

    let text = this.value;
    let responce;

    try {
        
        responce = await sendRequest ( text );
    
    } catch( error ) {

        console.log ( error );
        responce = null;

        selectRemove( document.querySelector( '.select' ) );
    }
    
    if ( !responce ) return;
            
    console.log( responce );

    createSelect( responce );
}

function selectRemove( select ) {

    if ( select ) {

        select.remove();
    }
}

function createSelect( responce ) {

    let selectLength = ( responce.items.length > 5 ) ? 5 : responce.item.length;
    let option;
    
    selectRemove( document.querySelector( '.select' ) );

    let select = document.createElement( 'select' );

    select.setAttribute( 'multiple', true );

    for( let i = 0; i < selectLength; i++ ){

        option = document.createElement( 'option' );
        option.textContent = responce.items[i].name;
        select.append( option );
    }

    select.classList.add( 'select' );
    select.classList.add( 'main__select' );

    document.querySelector('.main').append(select);
}

function debounceDecorator ( cb, delay ) {

    let timeoutHandler = null;

    return function() {
       
        let args = arguments;
        let context = this;

        return new Promise ( ( resolve, reject ) => {

            if( !timeoutHandler ) {

                timeoutHandler = setTimeout( () => {
                
                timeoutHandler = null;    
                //resolve (cb.apply( context, args).then( result => result, reject => reject ).catch( reject => reject ) );
                cb.apply( context, args).then( result => resolve( result ), error => reject( error ) );
            }, delay );
        } else {

            clearTimeout( timeoutHandler );
            timeoutHandler = setTimeout( () => {
               
                timeoutHandler = null;    
                //resolve ( cb.apply( context, args).then( result => result, reject => reject ).catch( reject => reject ) );
                cb.apply( context, args).then( result => resolve( result ), error => reject( error ) );
            }, delay );
        }
    });   
    }
}

async function send( message ){

    if ( !message ) {
    
        throw new RequestError ( "Строка запроса пуста", message );
    }

    if ( !message.match( /[\d,\w]/g ) ){

        throw new RequestError ( "Строка запроса содержит только пробелы", message );
    } 

    let url = new URL ( 'https://api.github.com/search/repositories' )

    url.searchParams.set( 'q', message );

    console.log ( url );

    let response = await fetch( url );
    
    if( response.ok ) {

        return response.json();
    
    } else {

        throw new HttpError ( 'Сетевая ошибка', response.status );
    }
}

class RequestError extends Error {

    constructor ( message, request ) {

        super ( message );
        this.name = "RequestError";
        this.request = request;
    }
}

class HttpError extends Error {

    constructor ( message, status ) {

        super ( message );
        this.name = "HttpError";
        this.status = status;
    }
}

