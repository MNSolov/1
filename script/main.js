const delayRequest = 700;   //Время задержки до отправки запроса на сервер, мс

const selectLevel = 5;      //Количество пунктов в выпадающем меню

const urlRequest = 'https://api.github.com/search/repositories'; //Адрес для отправки запроса на GitHub

const cardInfoObject = { Name: 'name', Owner: 'login', Stars: 'stargazers_count' };    //Поля в карточке и соответствующие им свойства
                                                                                        //в ответе сервера

const input = document.querySelector( '.input' );

const sendRequest = debounceDecorator( send, delayRequest );

input.addEventListener( 'input', requestSearch );

async function requestSearch() {

    let text = this.value;
    let responce;

    if ( !text )
        removeElement( document.querySelector( '.select' ) );

    try {
        
        responce = await sendRequest ( urlRequest, text );
    
    } catch( error ) {

        if ( error instanceof RequestError ) return;

        console.log ( error );
        responce = null;

        return;
    }
   
    if ( !responce ) return;

    let resultSearch = copyResultOfSearch ( responce, selectLevel, ...Object.values( cardInfoObject ) );

    let select = createSelect( resultSearch );

    let selectClickResult = decoratorSelectClick ( selectClick, resultSearch );

    select.addEventListener( 'click', selectClickResult );
}

function selectClick ( event, resultSearch ) {

    let objCard = findObj ( resultSearch );

    if ( !objCard ) {

        alert( 'Данные не найдены. Попробуйте еще раз' );
        return;
    }

    removeElement ( document.querySelector( '.select' ) );

    let card = createCard ( objCard );

    input.value = '';
}

function findObj ( resultSearch ) {

    let options = document.querySelectorAll( '.option' );
    let result = null;

    for ( let i = 0; i < options.length; i++ ) {

        if ( options[i] === event.target ) {

            result = Object.assign( resultSearch[i] );
        }
    }

    return result;
}

function clickButton( event ) {

    removeElement ( event.target.closest( 'div' ) );
}

function createCard ( objCard ) {

    let card = document.createElement( 'div' );
    card.classList.add( 'card' );
    card.classList.add( 'main__card' );
    
    for ( let key in cardInfoObject ) {

        let cardItem = document.createElement( 'p' );
        cardItem.classList.add( 'card__item' );
        cardItem.textContent = `${ key }: ${ objCard[ cardInfoObject[ key ] ] }`;
        card.append( cardItem );
    }

    let button = document.createElement( 'button' );
    button.classList.add( 'card__button' );

    let image = document.createElement( 'img' );
    image.src = './img/close.svg';

    button.append( image );

    button.addEventListener( 'click', clickButton );
    
    card.append( button );

    document.querySelector('.main').append( card );

    return card;
}

function decoratorSelectClick ( callback, resultSearch ) {

    return function () {

        callback.call( this, ...arguments, resultSearch,  );
    }
}

function removeElement( elem ) {

    if ( elem ) {

        elem.remove();
    }
}

function createSelect( responce ) {

    
    let option;
    
    removeElement( document.querySelector( '.select' ) );

    let select = document.createElement( 'select' );

    select.setAttribute( 'multiple', true );
    select.setAttribute( 'size', responce.length );

    for( let i = 0; i < responce.length; i++ ){

        option = document.createElement( 'option' );
        option.textContent = responce[i].name;
        option.classList.add( 'option' );
        select.append( option );
    }

    select.classList.add( 'select' );
    select.classList.add( 'search__select' );

    document.querySelector('.search').append(select);

    return select;
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
                cb.apply( context, args).then( result => resolve( result ), error => reject( error ) );
            }, delay );
        } else {

            clearTimeout( timeoutHandler );
            timeoutHandler = setTimeout( () => {
               
                timeoutHandler = null;    
                cb.apply( context, args).then( result => resolve( result ), error => reject( error ) );
            }, delay );
        }
    });   
    }
}

async function send( urlRequest, message ){

    if ( !message ) {

        throw new RequestError ( "Строка запроса пуста", message );
    }

    if ( !message.match( /[\d,\w]/g ) ){

        throw new RequestError ( "Строка запроса содержит только пробелы", message );
    } 

    let url = new URL ( urlRequest )

    url.searchParams.set( 'q', message );

    try {

        let response = await fetch( url );
    
        if( response.ok ) {

            return response.json();
    
        } else {

            throw new HttpError ( 'Сетевая ошибка', response.status );
        }
    } catch ( error ) {

        throw error;
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

function searchProperty ( obj, property, result ) {

    for ( let key in obj ) {

        if ( typeof ( obj[key] ) === 'object' ) {

            result = searchProperty( obj[key], property, result );
        }

        if ( key === property )
            return obj[key];
    }

    return result;
}

function copyObj( obj, ...args ) {

    let result = {};

    let strObjCopy = JSON.stringify( obj );
    let objCopy = JSON.parse( strObjCopy );

    for ( let elem of args ) {

        result[elem] = searchProperty( objCopy, elem );
    }

    return result;
}

function copyResultOfSearch ( obj, length, ...property ) {

    let lengthCopy = ( obj.items.length > length ) ? length : obj.items.length;
    let result = [];

    for ( let i = 0; i < lengthCopy; i++ ) {

        result[i] = copyObj( obj.items[i], ...property )
    }

    return result;
}
