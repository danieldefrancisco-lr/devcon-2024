import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';



const {Liferay, themeDisplay} = window;

// query: (r_account_accountEntryId eq '50217') or (startswith(aTA, 'XY')) or (alert eq true)
function MMRApiClient(props) {
	console.log(props);
	const [makerVocabularyId, setMakerVocabularyId] = useState("");
	const [makerId, setMakerId] = useState("");
	const [modelId, setModelId] = useState("");

	let friendlyPath = Liferay.ThemeDisplay.getLayoutRelativeURL();
	let friendlyPagePosition = friendlyPath.lastIndexOf('/');
	let friendlyPage = friendlyPath.substring(friendlyPagePosition);
	let layoutURL = Liferay.ThemeDisplay.getLayoutURL();
	console.log( "RelativeURL:" + friendlyPath);
	console.log("layoutURL:"+layoutURL);
	console.log("friendlyPage:"+friendlyPage);
	const [message, setMessage] = useState("");
	const webcamRef = useRef(null);
	const [imgSrc, setImgSrc] = useState(null);
	const myHeaders = new Headers();

	async function registerVehicle (newmaker,newmodel, newplate)  {
		let loggedUserId =  Liferay.ThemeDisplay.getUserId();
		await Liferay.Util.fetch('/o/c/registeredvehicles', {
			method: 'POST',
			headers: [
				['Content-type', 'application/json'],
				['Accept', 'application/json']
			],
			body: JSON.stringify({
				maker: newmaker,
				model: newmodel,
				plate: newplate,
				r_carMechanic_userId: loggedUserId
			  }),
		  })
		}

	async function asyncDetectedModelCategory (maker, model)  {
			let carmakerVocabularyId = await asyncFetchModelVocabulary();
			let carmakerCategoryId = await asyncFetchMakerCategory(maker,carmakerVocabularyId);
			let carmodelCategoryId = await asyncFetchModelCategory(model,carmakerCategoryId);
			return carmodelCategoryId;
	}

	async function asyncFetchModelVocabulary() {
		//Get Vocabulary Id of the Makers vocabulary
		const makerVocabularyResponse = await Liferay.Util.fetch("/o/headless-admin-taxonomy/v1.0/sites/"+props.globalSiteId+"/taxonomy-vocabularies?filter=name eq '"+props.MakerCategoryName+"'");
		const makerVocabularyData = await makerVocabularyResponse.json();
		const makerVocabularyId = await makerVocabularyData.items[0].id;
		await setMakerVocabularyId(makerVocabularyId);
		return makerVocabularyId;
	}

	async function asyncFetchMakerCategory(maker,makerVocabularyId) {
		//Get maker category Id
		const makerCategoryResponse = await Liferay.Util.fetch("/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/"+makerVocabularyId+"/taxonomy-categories?filter=name eq '"+maker+"'");
		const makerCategoryData = await makerCategoryResponse.json();
		const makerCategoryId =  makerCategoryData.items[0].id;
		await setMakerId(makerCategoryId);
		return makerCategoryId;
	}

	async function asyncFetchModelCategory(model,makerCategoryId) {
		//Get model category Id
		const modelCategoryResponse = await Liferay.Util.fetch("/o/headless-admin-taxonomy/v1.0/taxonomy-categories/"+makerCategoryId+"/taxonomy-categories?filter=name eq '"+model+"'");
		const modelCategoryData = await modelCategoryResponse.json();
		const modelCategoryId = modelCategoryData.items[0].id;
		await setModelId(modelCategoryId);
		console.log("modelCategoryId: "+modelCategoryId)
		return modelCategoryId;
	}
	
  			
        //	myHeaders.append("Content-Type", "multipart/form-data");
        //	myHeaders.append("apikey", "bdf8754910e1046d92575312c7b81b6ecffb268bf28fa5a145e369cd9af68b52");
		  
			async function capture() {
				myHeaders.append("apikey", props.apikey);
				const imageSrc = webcamRef.current.getScreenshot();
				setImgSrc(imageSrc);

			  // Convert imageSrc to a Blob
  				const blob = await fetch(imageSrc).then(res => res.blob());
		  
			  // Create form-data body
			  	const formData = new FormData();
			  // Append the image to the form-data
			  	formData.append('file', blob, 'car-image.jpg');
			 
			  	
				const response = await Liferay.Util.fetch('https://trafficeye.ai/recognition', {
					method: 'POST',
					headers: myHeaders,
					body: formData,
					redirect: "follow"
				  });
				
				  const data = await response.json();
				
				  const maker = data.data.combinations[0].roadUsers[0].mmr.make.value;
				  const model = data.data.combinations[0].roadUsers[0].mmr.model.value;
				  const licensePlate = data.data.combinations[0].roadUsers[0].plates[0].text.value;
				  registerVehicle(maker, model, licensePlate);
				  console.log('The maker and model of the car is:', maker + " " + model);
				  let carmodelCategoryId = await asyncDetectedModelCategory(maker,model);
				  // Wait for modelId to be updated
				  console.log("Model Id to build the link:" + modelId);
				  const sparePartsLink = document.getElementById('sparePartsLink');
				  sparePartsLink.querySelector('a').textContent = `See spare parts for the maker ${maker}`;
				  sparePartsLink.querySelector('a').href = `http://localhost:8080/web/ray-service-1/spare-parts?category=${carmodelCategoryId}`;
				 
			};
		
		  
			 return (
			  <div className="container">
				<div className="webcam-column">
				<Webcam
				  audio={false}
				  ref={webcamRef}
				  screenshotFormat="image/jpeg"
				/>
				</div>
				<div className="button-column">
				{imgSrc && <img src={imgSrc} alt="captura" />}
				<br></br>
				<button onClick={capture}>Capturar</button>
				<div id="sparePartsLink"><a></a></div>
				</div>
			  </div>
			  
			);
		  }


export default MMRApiClient;
