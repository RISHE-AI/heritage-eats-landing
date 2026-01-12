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
    shelfLife: "15-20 days"
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
    shelfLife: "20-25 days"
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
    shelfLife: "10-15 days (refrigerated: 30 days)"
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
    shelfLife: "15-20 days"
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
    shelfLife: "20-25 days"
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
    shelfLife: "30-45 days"
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
    shelfLife: "30-45 days"
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
    shelfLife: "3-4 months (refrigerated)"
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
    shelfLife: "2-3 months (refrigerated)"
  }
];

export const getProductsByCategory = (category: 'sweets' | 'snacks' | 'pickles') => {
  return products.filter(product => product.category === category);
};

export const getProductById = (id: string) => {
  return products.find(product => product.id === id);
};
