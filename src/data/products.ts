import { Product } from "@/types/product";

export const products: Product[] = [
  // SWEETS
  {
    id: "peanut-ladoo",
    nameEn: "Peanut Ladoo",
    nameTa: "வேர்க்கடலை உருண்டை",
    category: "sweets",
    price: 250,
    descriptionEn: "Traditional peanut ladoos made with roasted groundnuts and jaggery. A perfect blend of crunch and sweetness.",
    descriptionTa: "வறுத்த வேர்க்கடலை மற்றும் வெல்லத்துடன் தயாரிக்கப்படும் பாரம்பரிய வேர்க்கடலை உருண்டைகள். மொறுமொறுப்பு மற்றும் இனிப்பின் சரியான கலவை.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Roasted Peanuts", "Jaggery", "Cardamom", "Ghee"],
    ingredientsTa: ["வறுத்த வேர்க்கடலை", "வெல்லம்", "ஏலக்காய்", "நெய்"],
    benefitsEn: ["Rich in protein", "Good source of healthy fats", "Natural sweetener used", "No artificial preservatives"],
    benefitsTa: ["புரதம் நிறைந்தது", "ஆரோக்கியமான கொழுப்புகளின் நல்ல ஆதாரம்", "இயற்கை இனிப்பு பயன்படுத்தப்படுகிறது", "செயற்கை பதப்படுத்திகள் இல்லை"],
    storageEn: "Store in an airtight container at room temperature. Keep away from moisture.",
    storageTa: "அறை வெப்பநிலையில் காற்று புகாத கொள்கலனில் சேமிக்கவும். ஈரப்பதத்திலிருந்து விலக்கி வைக்கவும்.",
    shelfLife: "15-20 days",
    available: true,
    weightOptions: [
      { weight: "250g", price: 250, unit: "g" },
      { weight: "500g", price: 480, unit: "g" },
      { weight: "1kg", price: 920, unit: "g" }
    ]
  },
  {
    id: "black-sesame-ladoo",
    nameEn: "Black Sesame Ladoo",
    nameTa: "கருப்பு எள் உருண்டை",
    category: "sweets",
    price: 280,
    descriptionEn: "Nutritious black sesame ladoos packed with iron and calcium. A healthy traditional sweet.",
    descriptionTa: "இரும்பு மற்றும் கால்சியம் நிறைந்த சத்தான கருப்பு எள் உருண்டைகள். ஆரோக்கியமான பாரம்பரிய இனிப்பு.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Black Sesame Seeds", "Jaggery", "Cardamom", "Dry Ginger"],
    ingredientsTa: ["கருப்பு எள்", "வெல்லம்", "ஏலக்காய்", "சுக்கு"],
    benefitsEn: ["High in iron and calcium", "Good for bone health", "Rich in antioxidants", "Boosts immunity"],
    benefitsTa: ["இரும்பு மற்றும் கால்சியம் அதிகம்", "எலும்பு ஆரோக்கியத்திற்கு நல்லது", "ஆன்டிஆக்ஸிடன்ட்கள் நிறைந்தது", "நோய் எதிர்ப்பு சக்தியை அதிகரிக்கும்"],
    storageEn: "Store in a cool, dry place in an airtight container.",
    storageTa: "காற்று புகாத கொள்கலனில் குளிர்ந்த, உலர்ந்த இடத்தில் சேமிக்கவும்.",
    shelfLife: "20-25 days",
    available: true,
    weightOptions: [
      { weight: "250g", price: 280, unit: "g" },
      { weight: "500g", price: 540, unit: "g" },
      { weight: "1kg", price: 1050, unit: "g" }
    ]
  },
  {
    id: "urad-dal-ladoo",
    nameEn: "Urad Dal Ladoo",
    nameTa: "உளுந்து உருண்டை",
    category: "sweets",
    price: 300,
    descriptionEn: "Protein-rich urad dal ladoos made with roasted black gram and pure ghee. A winter delicacy.",
    descriptionTa: "வறுத்த உளுந்து மற்றும் தூய நெய்யுடன் தயாரிக்கப்படும் புரதம் நிறைந்த உளுந்து உருண்டைகள். ஒரு குளிர்கால சிறப்பு உணவு.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Urad Dal", "Sugar", "Ghee", "Cardamom", "Cashews"],
    ingredientsTa: ["உளுந்து", "சர்க்கரை", "நெய்", "ஏலக்காய்", "முந்திரி"],
    benefitsEn: ["High protein content", "Good for muscle building", "Provides warmth in winter", "Rich in B vitamins"],
    benefitsTa: ["அதிக புரத உள்ளடக்கம்", "தசை வளர்ச்சிக்கு நல்லது", "குளிர்காலத்தில் வெப்பத்தை அளிக்கிறது", "பி வைட்டமின்கள் நிறைந்தது"],
    storageEn: "Keep refrigerated for longer shelf life. Can be stored at room temperature for a week.",
    storageTa: "நீண்ட ஆயுளுக்கு குளிர்சாதன பெட்டியில் வைக்கவும். ஒரு வாரம் அறை வெப்பநிலையில் சேமிக்கலாம்.",
    shelfLife: "10-15 days (refrigerated: 30 days)",
    available: true,
    weightOptions: [
      { weight: "250g", price: 300, unit: "g" },
      { weight: "500g", price: 580, unit: "g" },
      { weight: "1kg", price: 1120, unit: "g" }
    ]
  },
  {
    id: "mysore-pak",
    nameEn: "Mysore Pak",
    nameTa: "மைசூர் பாக்",
    category: "sweets",
    price: 350,
    descriptionEn: "Authentic Mysore Pak made with generous amounts of ghee and gram flour. Melt-in-your-mouth goodness.",
    descriptionTa: "தாராளமான நெய் மற்றும் கடலை மாவுடன் தயாரிக்கப்படும் உண்மையான மைசூர் பாக். வாயில் கரையும் சுவை.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Gram Flour (Besan)", "Pure Ghee", "Sugar", "Cardamom"],
    ingredientsTa: ["கடலை மாவு", "தூய நெய்", "சர்க்கரை", "ஏலக்காய்"],
    benefitsEn: ["Energy booster", "Made with pure ghee", "Traditional recipe", "Perfect for festivals"],
    benefitsTa: ["ஆற்றல் அதிகரிப்பான்", "தூய நெய்யில் தயாரிக்கப்பட்டது", "பாரம்பரிய செய்முறை", "திருவிழாக்களுக்கு ஏற்றது"],
    storageEn: "Store in an airtight container. Best consumed within two weeks.",
    storageTa: "காற்று புகாத கொள்கலனில் சேமிக்கவும். இரண்டு வாரங்களுக்குள் உட்கொள்வது சிறந்தது.",
    shelfLife: "15-20 days",
    available: true,
    weightOptions: [
      { weight: "250g", price: 350, unit: "g" },
      { weight: "500g", price: 680, unit: "g" },
      { weight: "1kg", price: 1320, unit: "g" }
    ]
  },
  {
    id: "traditional-ladoo",
    nameEn: "Traditional Ladoo",
    nameTa: "பாரம்பரிய லட்டு",
    category: "sweets",
    price: 220,
    descriptionEn: "Classic boondi ladoo made with love using traditional methods. Perfect for all occasions.",
    descriptionTa: "பாரம்பரிய முறைகளைப் பயன்படுத்தி அன்புடன் தயாரிக்கப்படும் கிளாசிக் பூந்தி லட்டு. எல்லா சந்தர்ப்பங்களுக்கும் ஏற்றது.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Gram Flour", "Sugar Syrup", "Ghee", "Cardamom", "Raisins", "Cashews"],
    ingredientsTa: ["கடலை மாவு", "சர்க்கரை பாகு", "நெய்", "ஏலக்காய்", "திராட்சை", "முந்திரி"],
    benefitsEn: ["Festive favorite", "Made fresh to order", "No artificial colors", "Traditional taste"],
    benefitsTa: ["திருவிழா விருப்பமானது", "ஆர்டருக்கு புதிதாக தயாரிக்கப்படுகிறது", "செயற்கை வண்ணங்கள் இல்லை", "பாரம்பரிய சுவை"],
    storageEn: "Store at room temperature in an airtight container.",
    storageTa: "காற்று புகாத கொள்கலனில் அறை வெப்பநிலையில் சேமிக்கவும்.",
    shelfLife: "20-25 days",
    available: true,
    weightOptions: [
      { weight: "250g", price: 220, unit: "g" },
      { weight: "500g", price: 420, unit: "g" },
      { weight: "1kg", price: 800, unit: "g" }
    ]
  },
  // SNACKS
  {
    id: "mixture",
    nameEn: "Mixture",
    nameTa: "மிக்ஸர்",
    category: "snacks",
    price: 180,
    descriptionEn: "Crispy South Indian mixture with the perfect blend of spices. A tea-time favorite.",
    descriptionTa: "சரியான மசாலா கலவையுடன் மொறுமொறுப்பான தென்னிந்திய மிக்ஸர். டீ நேர விருப்பமானது.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Rice Flakes", "Peanuts", "Curry Leaves", "Chilli", "Salt", "Oil"],
    ingredientsTa: ["அவல்", "வேர்க்கடலை", "கறிவேப்பிலை", "மிளகாய்", "உப்பு", "எண்ணெய்"],
    benefitsEn: ["Crunchy texture", "Perfect snacking option", "Made with fresh spices", "No MSG added"],
    benefitsTa: ["மொறுமொறுப்பான அமைப்பு", "சரியான சிற்றுண்டி விருப்பம்", "புதிய மசாலாக்களுடன் தயாரிக்கப்பட்டது", "MSG சேர்க்கப்படவில்லை"],
    storageEn: "Store in an airtight container to maintain crispiness.",
    storageTa: "மொறுமொறுப்பை பராமரிக்க காற்று புகாத கொள்கலனில் சேமிக்கவும்.",
    shelfLife: "30-45 days",
    available: true,
    weightOptions: [
      { weight: "250g", price: 180, unit: "g" },
      { weight: "500g", price: 350, unit: "g" },
      { weight: "1kg", price: 680, unit: "g" }
    ]
  },
  {
    id: "murukku",
    nameEn: "Murukku",
    nameTa: "முறுக்கு",
    category: "snacks",
    price: 200,
    descriptionEn: "Authentic hand-pressed murukku made with rice flour and urad dal. Perfectly crunchy and flavorful.",
    descriptionTa: "அரிசி மாவு மற்றும் உளுந்துடன் கையால் அழுத்தப்பட்ட உண்மையான முறுக்கு. சரியான மொறுமொறுப்பு மற்றும் சுவை.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Rice Flour", "Urad Dal Flour", "Butter", "Cumin", "Sesame Seeds", "Salt"],
    ingredientsTa: ["அரிசி மாவு", "உளுந்து மாவு", "வெண்ணெய்", "சீரகம்", "எள்", "உப்பு"],
    benefitsEn: ["Handmade with love", "Traditional recipe", "Perfect crunch", "Great with tea or coffee"],
    benefitsTa: ["அன்புடன் கையால் தயாரிக்கப்பட்டது", "பாரம்பரிய செய்முறை", "சரியான மொறுமொறுப்பு", "தேநீர் அல்லது காபியுடன் சிறந்தது"],
    storageEn: "Keep in an airtight container at room temperature.",
    storageTa: "அறை வெப்பநிலையில் காற்று புகாத கொள்கலனில் வைக்கவும்.",
    shelfLife: "30-45 days",
    available: true,
    weightOptions: [
      { weight: "250g", price: 200, unit: "g" },
      { weight: "500g", price: 380, unit: "g" },
      { weight: "1kg", price: 740, unit: "g" }
    ]
  },
  // PICKLES / THOKKU
  {
    id: "pirandai-thokku",
    nameEn: "Pirandai Thokku",
    nameTa: "பிரண்டை தொக்கு",
    category: "pickles",
    price: 150,
    descriptionEn: "Traditional pirandai thokku known for its digestive and bone-strengthening properties. A healthy accompaniment.",
    descriptionTa: "செரிமான மற்றும் எலும்பு வலுப்படுத்தும் பண்புகளுக்கு பெயர் பெற்ற பாரம்பரிய பிரண்டை தொக்கு. ஆரோக்கியமான சைட் டிஷ்.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Pirandai (Veldt Grape)", "Tamarind", "Chilli", "Salt", "Sesame Oil"],
    ingredientsTa: ["பிரண்டை", "புளி", "மிளகாய்", "உப்பு", "நல்லெண்ணெய்"],
    benefitsEn: ["Aids digestion", "Good for bones", "Rich in calcium", "Traditional medicine properties"],
    benefitsTa: ["செரிமானத்திற்கு உதவுகிறது", "எலும்புகளுக்கு நல்லது", "கால்சியம் நிறைந்தது", "பாரம்பரிய மருத்துவ பண்புகள்"],
    storageEn: "Refrigerate after opening. Use clean, dry spoon.",
    storageTa: "திறந்த பிறகு குளிர்சாதன பெட்டியில் வைக்கவும். சுத்தமான, உலர்ந்த கரண்டியைப் பயன்படுத்தவும்.",
    shelfLife: "3-4 months (refrigerated)",
    available: true,
    weightOptions: [
      { weight: "200g", price: 150, unit: "g" },
      { weight: "400g", price: 280, unit: "g" },
      { weight: "1kg", price: 680, unit: "g" }
    ]
  },
  {
    id: "tomato-thokku",
    nameEn: "Tomato Thokku",
    nameTa: "தக்காளி தொக்கு",
    category: "pickles",
    price: 120,
    descriptionEn: "Tangy and spicy tomato thokku made with fresh tomatoes and aromatic spices. Perfect with rice or dosa.",
    descriptionTa: "புதிய தக்காளி மற்றும் நறுமண மசாலாக்களுடன் தயாரிக்கப்படும் புளிப்பும் காரமுமான தக்காளி தொக்கு. சாதம் அல்லது தோசையுடன் சரியானது.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Fresh Tomatoes", "Red Chilli", "Garlic", "Fenugreek", "Mustard", "Sesame Oil"],
    ingredientsTa: ["புதிய தக்காளி", "சிவப்பு மிளகாய்", "பூண்டு", "வெந்தயம்", "கடுகு", "நல்லெண்ணெய்"],
    benefitsEn: ["Rich in lycopene", "No preservatives", "Homemade freshness", "Versatile condiment"],
    benefitsTa: ["லைகோபீன் நிறைந்தது", "பதப்படுத்திகள் இல்லை", "வீட்டு புத்துணர்ச்சி", "பல்துறை சைட் டிஷ்"],
    storageEn: "Store in refrigerator. Always use clean, dry spoon.",
    storageTa: "குளிர்சாதன பெட்டியில் சேமிக்கவும். எப்போதும் சுத்தமான, உலர்ந்த கரண்டியைப் பயன்படுத்தவும்.",
    shelfLife: "2-3 months (refrigerated)",
    available: true,
    weightOptions: [
      { weight: "200g", price: 120, unit: "g" },
      { weight: "400g", price: 220, unit: "g" },
      { weight: "1kg", price: 520, unit: "g" }
    ]
  },
  // MALTS
  {
    id: "abc-malt",
    nameEn: "Apple Beetroot Carrot (ABC) Malt",
    nameTa: "ஆப்பிள் பீட்ரூட் கேரட் மால்ட்",
    category: "malts",
    price: 280,
    descriptionEn: "Nutritious ABC malt made with apple, beetroot, and carrot. Perfect health drink for children and adults.",
    descriptionTa: "ஆப்பிள், பீட்ரூட் மற்றும் கேரட்டுடன் தயாரிக்கப்படும் சத்தான ABC மால்ட். குழந்தைகள் மற்றும் பெரியவர்களுக்கான சிறந்த ஆரோக்கிய பானம்.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Apple", "Beetroot", "Carrot", "Jaggery", "Cardamom", "Dry Fruits"],
    ingredientsTa: ["ஆப்பிள்", "பீட்ரூட்", "கேரட்", "வெல்லம்", "ஏலக்காய்", "உலர் பழங்கள்"],
    benefitsEn: ["Rich in vitamins A, C, and iron", "Boosts immunity", "Good for skin health", "Natural energy booster"],
    benefitsTa: ["வைட்டமின் A, C மற்றும் இரும்பு நிறைந்தது", "நோய் எதிர்ப்பு சக்தியை அதிகரிக்கும்", "தோல் ஆரோக்கியத்திற்கு நல்லது", "இயற்கை ஆற்றல் அதிகரிப்பான்"],
    storageEn: "Store in an airtight container in a cool, dry place.",
    storageTa: "குளிர்ந்த, உலர்ந்த இடத்தில் காற்று புகாத கொள்கலனில் சேமிக்கவும்.",
    shelfLife: "3 months",
    available: true,
    weightOptions: [
      { weight: "250g", price: 280, unit: "g" },
      { weight: "500g", price: 540, unit: "g" },
      { weight: "1kg", price: 1050, unit: "g" }
    ]
  },
  {
    id: "beetroot-malt",
    nameEn: "Beetroot Malt",
    nameTa: "பீட்ரூட் மால்ட்",
    category: "malts",
    price: 250,
    descriptionEn: "Pure beetroot malt powder for improved blood circulation and stamina. Natural health supplement.",
    descriptionTa: "மேம்படுத்தப்பட்ட இரத்த ஓட்டம் மற்றும் சகிப்புத்தன்மைக்கான தூய பீட்ரூட் மால்ட் பொடி. இயற்கை ஆரோக்கிய சப்ளிமெண்ட்.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Beetroot", "Jaggery", "Cardamom", "Almonds"],
    ingredientsTa: ["பீட்ரூட்", "வெல்லம்", "ஏலக்காய்", "பாதாம்"],
    benefitsEn: ["Improves hemoglobin", "Rich in iron and folate", "Natural blood purifier", "Boosts stamina"],
    benefitsTa: ["ஹீமோகுளோபினை மேம்படுத்துகிறது", "இரும்பு மற்றும் ஃபோலேட் நிறைந்தது", "இயற்கை இரத்த சுத்திகரிப்பான்", "சகிப்புத்தன்மையை அதிகரிக்கும்"],
    storageEn: "Store in an airtight container away from moisture.",
    storageTa: "ஈரப்பதத்திலிருந்து விலக்கி காற்று புகாத கொள்கலனில் சேமிக்கவும்.",
    shelfLife: "3 months",
    available: true,
    weightOptions: [
      { weight: "250g", price: 250, unit: "g" },
      { weight: "500g", price: 480, unit: "g" },
      { weight: "1kg", price: 920, unit: "g" }
    ]
  },
  {
    id: "carrot-malt",
    nameEn: "Carrot Malt",
    nameTa: "கேரட் மால்ட்",
    category: "malts",
    price: 240,
    descriptionEn: "Delicious carrot malt for healthy eyes and glowing skin. Perfect for growing children.",
    descriptionTa: "ஆரோக்கியமான கண்கள் மற்றும் ஒளிரும் சருமத்திற்கான சுவையான கேரட் மால்ட். வளரும் குழந்தைகளுக்கு சரியானது.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Carrot", "Jaggery", "Cardamom", "Cashews"],
    ingredientsTa: ["கேரட்", "வெல்லம்", "ஏலக்காய்", "முந்திரி"],
    benefitsEn: ["Rich in Vitamin A", "Good for eyesight", "Improves skin health", "Natural antioxidant"],
    benefitsTa: ["வைட்டமின் A நிறைந்தது", "பார்வைக்கு நல்லது", "தோல் ஆரோக்கியத்தை மேம்படுத்துகிறது", "இயற்கை ஆன்டிஆக்ஸிடன்ட்"],
    storageEn: "Store in an airtight container in a cool place.",
    storageTa: "குளிர்ந்த இடத்தில் காற்று புகாத கொள்கலனில் சேமிக்கவும்.",
    shelfLife: "3 months",
    available: true,
    weightOptions: [
      { weight: "250g", price: 240, unit: "g" },
      { weight: "500g", price: 460, unit: "g" },
      { weight: "1kg", price: 880, unit: "g" }
    ]
  },
  {
    id: "sevvalai-malt",
    nameEn: "Sevvalai (Red Banana) Malt",
    nameTa: "செவ்வாழை மால்ட்",
    category: "malts",
    price: 300,
    descriptionEn: "Traditional red banana malt for instant energy and strength. Highly nutritious for all ages.",
    descriptionTa: "உடனடி ஆற்றல் மற்றும் வலிமைக்கான பாரம்பரிய செவ்வாழை மால்ட். எல்லா வயதினருக்கும் மிகவும் சத்தானது.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Red Banana", "Jaggery", "Cardamom", "Dry Ginger"],
    ingredientsTa: ["செவ்வாழை", "வெல்லம்", "ஏலக்காய்", "சுக்கு"],
    benefitsEn: ["Natural energy booster", "Rich in potassium", "Good for digestion", "Strengthens bones"],
    benefitsTa: ["இயற்கை ஆற்றல் அதிகரிப்பான்", "பொட்டாசியம் நிறைந்தது", "செரிமானத்திற்கு நல்லது", "எலும்புகளை வலுப்படுத்துகிறது"],
    storageEn: "Store in an airtight container at room temperature.",
    storageTa: "அறை வெப்பநிலையில் காற்று புகாத கொள்கலனில் சேமிக்கவும்.",
    shelfLife: "3 months",
    available: true,
    weightOptions: [
      { weight: "250g", price: 300, unit: "g" },
      { weight: "500g", price: 580, unit: "g" },
      { weight: "1kg", price: 1120, unit: "g" }
    ]
  },
  {
    id: "atthi-malt",
    nameEn: "Atthi Malt",
    nameTa: "அத்தி மால்ட்",
    category: "malts",
    price: 320,
    descriptionEn: "Nutritious fig malt for improved digestion and bone health. Traditional Siddha medicine ingredient.",
    descriptionTa: "மேம்பட்ட செரிமானம் மற்றும் எலும்பு ஆரோக்கியத்திற்கான சத்தான அத்தி மால்ட். பாரம்பரிய சித்த மருத்துவ மூலப்பொருள்.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Dried Figs", "Jaggery", "Cardamom", "Almonds", "Honey"],
    ingredientsTa: ["உலர்ந்த அத்திப்பழம்", "வெல்லம்", "ஏலக்காய்", "பாதாம்", "தேன்"],
    benefitsEn: ["Rich in fiber", "Improves digestion", "Good for bone density", "Natural laxative"],
    benefitsTa: ["நார்ச்சத்து நிறைந்தது", "செரிமானத்தை மேம்படுத்துகிறது", "எலும்பு அடர்த்திக்கு நல்லது", "இயற்கை மலமிளக்கி"],
    storageEn: "Store in an airtight container in a cool, dry place.",
    storageTa: "குளிர்ந்த, உலர்ந்த இடத்தில் காற்று புகாத கொள்கலனில் சேமிக்கவும்.",
    shelfLife: "3 months",
    available: true,
    weightOptions: [
      { weight: "250g", price: 320, unit: "g" },
      { weight: "500g", price: 620, unit: "g" },
      { weight: "1kg", price: 1200, unit: "g" }
    ]
  },
  {
    id: "satthu-maavu",
    nameEn: "Satthu Maavu",
    nameTa: "சத்து மாவு",
    category: "malts",
    price: 350,
    descriptionEn: "Multi-grain health mix powder for complete nutrition. Perfect for babies, children, and adults.",
    descriptionTa: "முழுமையான ஊட்டச்சத்துக்கான பல தானிய ஆரோக்கிய கலவை பொடி. குழந்தைகள் மற்றும் பெரியவர்களுக்கு சரியானது.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Ragi", "Wheat", "Rice", "Moong Dal", "Groundnuts", "Almonds", "Cardamom"],
    ingredientsTa: ["ராகி", "கோதுமை", "அரிசி", "பாசிப்பருப்பு", "வேர்க்கடலை", "பாதாம்", "ஏலக்காய்"],
    benefitsEn: ["Complete nutrition", "Rich in protein and fiber", "Good for bone growth", "Boosts immunity"],
    benefitsTa: ["முழுமையான ஊட்டச்சத்து", "புரதம் மற்றும் நார்ச்சத்து நிறைந்தது", "எலும்பு வளர்ச்சிக்கு நல்லது", "நோய் எதிர்ப்பு சக்தியை அதிகரிக்கும்"],
    storageEn: "Store in an airtight container. Keep refrigerated for longer shelf life.",
    storageTa: "காற்று புகாத கொள்கலனில் சேமிக்கவும். நீண்ட ஆயுளுக்கு குளிர்சாதன பெட்டியில் வைக்கவும்.",
    shelfLife: "3-4 months",
    available: true,
    weightOptions: [
      { weight: "250g", price: 350, unit: "g" },
      { weight: "500g", price: 680, unit: "g" },
      { weight: "1kg", price: 1320, unit: "g" }
    ]
  },
  // PODI
  {
    id: "curry-leaves-podi",
    nameEn: "Curry Leaves Podi",
    nameTa: "கறிவேப்பிலை பொடி",
    category: "podi",
    price: 120,
    descriptionEn: "Aromatic curry leaves podi for hair health and flavor. Essential South Indian condiment.",
    descriptionTa: "முடி ஆரோக்கியம் மற்றும் சுவைக்கான நறுமணமான கறிவேப்பிலை பொடி. அத்தியாவசிய தென்னிந்திய சைட் டிஷ்.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Curry Leaves", "Urad Dal", "Chana Dal", "Dried Chilli", "Salt", "Sesame Oil"],
    ingredientsTa: ["கறிவேப்பிலை", "உளுந்து", "கடலைப்பருப்பு", "உலர் மிளகாய்", "உப்பு", "நல்லெண்ணெய்"],
    benefitsEn: ["Promotes hair growth", "Rich in iron", "Aids digestion", "Natural flavor enhancer"],
    benefitsTa: ["முடி வளர்ச்சியை ஊக்குவிக்கும்", "இரும்பு நிறைந்தது", "செரிமானத்திற்கு உதவுகிறது", "இயற்கை சுவை அதிகரிப்பான்"],
    storageEn: "Store in an airtight container away from moisture.",
    storageTa: "ஈரப்பதத்திலிருந்து விலக்கி காற்று புகாத கொள்கலனில் சேமிக்கவும்.",
    shelfLife: "2-3 months",
    available: true,
    weightOptions: [
      { weight: "100g", price: 120, unit: "g" },
      { weight: "200g", price: 220, unit: "g" },
      { weight: "500g", price: 520, unit: "g" }
    ]
  },
  {
    id: "pirandai-podi",
    nameEn: "Pirandai Podi",
    nameTa: "பிரண்டை பொடி",
    category: "podi",
    price: 150,
    descriptionEn: "Traditional pirandai podi for bone health and digestion. Ancient Siddha medicine ingredient.",
    descriptionTa: "எலும்பு ஆரோக்கியம் மற்றும் செரிமானத்திற்கான பாரம்பரிய பிரண்டை பொடி. பண்டைய சித்த மருத்துவ மூலப்பொருள்.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Pirandai", "Black Pepper", "Cumin", "Dried Ginger", "Salt"],
    ingredientsTa: ["பிரண்டை", "மிளகு", "சீரகம்", "சுக்கு", "உப்பு"],
    benefitsEn: ["Strengthens bones", "Aids digestion", "Rich in calcium", "Traditional medicine"],
    benefitsTa: ["எலும்புகளை வலுப்படுத்துகிறது", "செரிமானத்திற்கு உதவுகிறது", "கால்சியம் நிறைந்தது", "பாரம்பரிய மருத்துவம்"],
    storageEn: "Store in an airtight container in a cool, dry place.",
    storageTa: "குளிர்ந்த, உலர்ந்த இடத்தில் காற்று புகாத கொள்கலனில் சேமிக்கவும்.",
    shelfLife: "3-4 months",
    available: true,
    weightOptions: [
      { weight: "100g", price: 150, unit: "g" },
      { weight: "200g", price: 280, unit: "g" },
      { weight: "500g", price: 680, unit: "g" }
    ]
  },
  {
    id: "sundaikai-podi",
    nameEn: "Sundaikai Podi",
    nameTa: "சுண்டைக்காய் பொடி",
    category: "podi",
    price: 140,
    descriptionEn: "Traditional sundaikai podi for improved appetite and digestion. Natural deworming properties.",
    descriptionTa: "மேம்பட்ட பசி மற்றும் செரிமானத்திற்கான பாரம்பரிய சுண்டைக்காய் பொடி. இயற்கை புழு நீக்க பண்புகள்.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Sundaikai", "Tamarind", "Chilli", "Salt", "Asafoetida"],
    ingredientsTa: ["சுண்டைக்காய்", "புளி", "மிளகாய்", "உப்பு", "பெருங்காயம்"],
    benefitsEn: ["Natural dewormer", "Improves appetite", "Aids digestion", "Rich in antioxidants"],
    benefitsTa: ["இயற்கை புழு நீக்கி", "பசியை மேம்படுத்துகிறது", "செரிமானத்திற்கு உதவுகிறது", "ஆன்டிஆக்ஸிடன்ட்கள் நிறைந்தது"],
    storageEn: "Store in an airtight container away from moisture.",
    storageTa: "ஈரப்பதத்திலிருந்து விலக்கி காற்று புகாத கொள்கலனில் சேமிக்கவும்.",
    shelfLife: "3-4 months",
    available: true,
    weightOptions: [
      { weight: "100g", price: 140, unit: "g" },
      { weight: "200g", price: 260, unit: "g" },
      { weight: "500g", price: 620, unit: "g" }
    ]
  },
  {
    id: "paruppu-podi",
    nameEn: "Paruppu Podi",
    nameTa: "பருப்பு பொடி",
    category: "podi",
    price: 100,
    descriptionEn: "Classic paruppu podi made with lentils and spices. Perfect accompaniment for rice and ghee.",
    descriptionTa: "பருப்பு மற்றும் மசாலாக்களுடன் தயாரிக்கப்படும் கிளாசிக் பருப்பு பொடி. சாதம் மற்றும் நெய்க்கு சரியான துணை.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Toor Dal", "Chana Dal", "Urad Dal", "Dried Chilli", "Black Pepper", "Asafoetida"],
    ingredientsTa: ["துவரம் பருப்பு", "கடலைப்பருப்பு", "உளுந்து", "உலர் மிளகாய்", "மிளகு", "பெருங்காயம்"],
    benefitsEn: ["High in protein", "Easy to digest", "Traditional flavor", "Nutritious"],
    benefitsTa: ["புரதம் அதிகம்", "எளிதில் செரிக்கும்", "பாரம்பரிய சுவை", "சத்தானது"],
    storageEn: "Store in an airtight container at room temperature.",
    storageTa: "அறை வெப்பநிலையில் காற்று புகாத கொள்கலனில் சேமிக்கவும்.",
    shelfLife: "2-3 months",
    available: true,
    weightOptions: [
      { weight: "100g", price: 100, unit: "g" },
      { weight: "200g", price: 180, unit: "g" },
      { weight: "500g", price: 420, unit: "g" }
    ]
  },
  {
    id: "poondu-podi",
    nameEn: "Poondu Podi",
    nameTa: "பூண்டு பொடி",
    category: "podi",
    price: 130,
    descriptionEn: "Flavorful garlic podi for enhanced taste and health benefits. Natural immunity booster.",
    descriptionTa: "மேம்படுத்தப்பட்ட சுவை மற்றும் ஆரோக்கிய நன்மைகளுக்கான சுவையான பூண்டு பொடி. இயற்கை நோய் எதிர்ப்பு சக்தி அதிகரிப்பான்.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    ingredientsEn: ["Garlic", "Dried Chilli", "Urad Dal", "Salt", "Sesame Oil"],
    ingredientsTa: ["பூண்டு", "உலர் மிளகாய்", "உளுந்து", "உப்பு", "நல்லெண்ணெய்"],
    benefitsEn: ["Boosts immunity", "Good for heart health", "Natural antibiotic", "Improves digestion"],
    benefitsTa: ["நோய் எதிர்ப்பு சக்தியை அதிகரிக்கும்", "இதய ஆரோக்கியத்திற்கு நல்லது", "இயற்கை ஆன்டிபயாடிக்", "செரிமானத்தை மேம்படுத்துகிறது"],
    storageEn: "Store in an airtight container in a cool place.",
    storageTa: "குளிர்ந்த இடத்தில் காற்று புகாத கொள்கலனில் சேமிக்கவும்.",
    shelfLife: "2-3 months",
    available: true,
    weightOptions: [
      { weight: "100g", price: 130, unit: "g" },
      { weight: "200g", price: 240, unit: "g" },
      { weight: "500g", price: 580, unit: "g" }
    ]
  }
];

export const getProductsByCategory = (category: 'sweets' | 'snacks' | 'pickles' | 'malts' | 'podi') => {
  return products.filter(product => product.category === category && product.available !== false);
};

export const getProductById = (id: string) => {
  return products.find(product => product.id === id);
};

export const getAllCategories = () => {
  return ['sweets', 'snacks', 'pickles', 'malts', 'podi'] as const;
};
