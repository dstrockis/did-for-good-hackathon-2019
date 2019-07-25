

// claim = 
// {
//   "@context": "https://identiverse-university.azurewebsites.net/credential/v1",
//   "@type": "BookStoreDiscount",
//   "customer": "Alice Smith",
//   "discount": "10% off",
//   "discountCode": "ContosoUniversity",
//   "isGift": false,
//   "seller": "Fabrikam Bookstore",
//   "did": "did:ion:test:...."
// }

  function applyDiscount(){
    if (document.getElementById('homepage')) {
      qr_output.setAttribute('verified', '');
      qr_output.querySelector('img').src = 'image/demo/check.png';
    }
    if (document.getElementById('student_discount')) {
      student_discount.setAttribute('applied', '');
      grand_total.textContent = '$106.24';
    }
    const speed = 400;
    $('#qr_spacer').removeClass('hidden');
    $('#qr_notice').slideDown(speed);
    $('.checkout-quick-box').slideUp(speed);
  }


(function(){
  $('#qr_notice').slideUp('0', () => {
    $('#qr_notice').removeClass('hidden');
  });

  function handleServiceErrors(response) {
    if (response.ok) return response;
    throw response;
  }


  var qrcode = new QRCode(qr_output);

  fetch('/auth-selfissue')
    .then(handleServiceErrors)
    .then(function(response) {
        response.text().then(function(authRequest) {
          // present the QR code to the user
          qrcode.makeCode(authRequest);
        })
    })
    .catch(function(e) {
      console.log(e);
    });

  function getStudentClaim() {
    fetch('/studentClaims')
      .then(handleServiceErrors)
      .then((response) => {
        response.text().then((content) => {
          const claim = JSON.parse(content);
          console.log(claim);
          applyDiscount(claim);
        })
      }).catch((error) => {
        console.error(error);
        setTimeout(getStudentClaim, 1000);
      });
  }

  getStudentClaim();
})()