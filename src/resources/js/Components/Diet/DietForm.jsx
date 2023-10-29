import React, { useState, useRef } from 'react';
import Modal from '../Modal';

export default function DietForm({diet = null}) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        calorie_max: "",
        calorie_min: "",
        protein_max: "",
        fat_max: "",
        carb_max: "",
        start_time: "",
        end_time: "",
        every_day: true,
        day_of_week: ""
    });
    const [errors, setErrors] = useState({});
    const lastInputsModifiedRef = useRef([]);

    // diet window
    const dietWindowsRef = useRef([]);
    const daysChecked = useRef([]);
    const weekDaySelectionRef = useRef(null);
    const startTime = useRef(null);
    const endTime = useRef(null);
    const [windowErrors, setWindowErrors] = useState({});
    const idRef = useRef(0);
    const dietWindowTableRef = useRef(null);
    // modal
    const [windowModal, setWindowModal] = useState(false);
    const selectedWindowId = useRef(null);
    const toggleWindowModal = (id = null) =>{

        if(id == null)
            setWindowModal(false);
        else {
            setWindowModal(true);
            selectedWindowId.current = id;
        }
    }


    const validate = (data) => {

        let newErrors = {};

        if(!data.name.trim()){
            newErrors.name = "Name is required";
        }

        if(!data.description.trim()){
            newErrors.description = "Description is required";
        }

        if(data.calorie_min || data.calorie_max){

            if(data.calorie_max < 0){
                data.calorie_max = 0;
            }

            if(data.calorie_min < 0){
                data.calorie_min = 0;
            }

            if(data.calorie_min > data.calorie_max){
                newErrors.calorie_min = "Min calories must be less than max calories";
            } else if(data.calorie_max < data.calorie_min) {
                newErrors.calorie_max = "Max calories must be more than min calories";
            }
        }

        // ensure each percentage field is between 0 and 100
        const properties = ['protein_max', 'fat_max', 'carb_max'];

        properties.forEach(property => {
            if (data[property] > 100) {
                data[property] = 100;
            } else if (data[property] < 0) {
                data[property] = 0;
            }
        });

        setErrors(newErrors);

        return data;
    }

    const adjustPertentages = (staticPercent, adjustments = []) => {

        // total adjustments amount
        let adjustTotal = 0;
        for(let i = 0; i < adjustments.length; i++) {

            adjustTotal += +adjustments[i];
        }
        
        let overFlowPercent = +staticPercent + +adjustTotal - 100;

        for(let i = 0; i < adjustments.length; i++) {

            let weight = +adjustments[i] / +adjustTotal;

            if(isNaN(weight)){
                weight = 1 / adjustments.length;
            }

            adjustments[i] -= +weight * +overFlowPercent;
            adjustments[i] = adjustments[i].toFixed(2);
        }

        return adjustments;
    }

    const timeToNumber = (time) => {

        let a = time.split(":");
        return (+a[0] * 60) + +a[1];
    };

    const dayValueToString = (value) => {

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days[value - 1];
    }

    const getStaticProps = () => {
        // Get unique values
        lastInputsModifiedRef.current = [...new Set(lastInputsModifiedRef.current)];
    
        // Ensure we only have the last two unique items
        while (lastInputsModifiedRef.current.length > 2) {
            lastInputsModifiedRef.current.shift(); // Remove from the front of the array
        }
    
        return lastInputsModifiedRef.current;
    };

    const getPercentFieldNames = () => {
        return ['protein_max', 'carb_max', 'fat_max'];
    }
    
    
    const handlePercentages = (fieldName, formData) =>{

        lastInputsModifiedRef.current = [...lastInputsModifiedRef.current, fieldName];

        let adjustProps = getPercentFieldNames();
        let staticProps = getStaticProps();

        // remove any entires found in staticProps from adjustProps
        adjustProps = adjustProps.filter(value => !staticProps.includes(value));

        // get staticTotal
        let staticTotal = 0;
        staticProps.forEach(prop => {

            staticTotal += +formData[prop];
        });

        // exception: if staticProps are more than 100
        if(staticTotal > 100) {

            // make adjustProps staticProps (so they can get resized properly)
            adjustProps = getPercentFieldNames();
            adjustProps = adjustProps.filter(value => value != fieldName);

            staticTotal = formData[fieldName];
        }

        // create numerical array representing adjustProps
        let adjustTotals = [];
        adjustProps.forEach(prop => {

            adjustTotals.push(+formData[prop]);
        });

        let adjustments = adjustPertentages(staticTotal, adjustTotals);
        for(let i = 0; i < adjustProps.length; i++) {

            formData[adjustProps[i]] = adjustments[i];
        }

        return formData;
    }

    const removeWindow = () => {

        setWindowModal(false);

        if(selectedWindowId.current != null){
            dietWindowsRef.current = dietWindowsRef.current.filter(window => window.id != selectedWindowId.current);
        }
        checkDietWindowTable();
    };

    const addWindow = () => {
        let newErrors = {};
        let newWindows = [...dietWindowsRef.current];
        let valid = true;
    
        // validation
        if(startTime.current.value === '') {
            newErrors.start_time = "Start time must be set";
            valid = false;
        }
    
        if(endTime.current.value === '') {
            newErrors.end_time = "End time must be set";
            valid = false;
        }

        if(timeToNumber(startTime.current.value) >= timeToNumber(endTime.current.value)){

            newErrors.end_time = "End time must be later than start time";
            valid = false;
        }

        // check if time overlaps other windows
        dietWindowsRef.current.forEach(window => {

            if(daysChecked.current.includes(window.day) || window.day == null){
                // convert to numerics
                let start_value = timeToNumber(startTime.current.value);
                let end_value = timeToNumber(endTime.current.value);
                let win_start_value = timeToNumber(window.start_time);
                let win_end_value = timeToNumber(window.end_time);        // hide diet window table if no windows existeToNumber(window.end_time);

                if((start_value >= win_start_value && start_value <= win_end_value ) 
                    || end_value >= win_start_value && end_value <= win_end_value){
                    newErrors.start_time = "Time range can't overlap with other windows";
                    valid = false;
                }
            }
        });
    
        if(valid){
            if(daysChecked.current.length > 0){
                daysChecked.current.forEach(day => {
                    newWindows.push({
                        id: idRef.current++,
                        start_time: startTime.current.value,
                        end_time: endTime.current.value,
                        day: day
                    });
                });
            } else{
                newWindows.push({
                    id: idRef.current++,
                    start_time: startTime.current.value,
                    end_time: endTime.current.value,
                    day: null
                });
            }
        }
    
        dietWindowsRef.current = newWindows;
        checkDietWindowTable();
        setWindowErrors(newErrors);
    }
    
    const addDays = (name, checked) => {

        for(let i = 0; i < 7; i++){

            let dayValue = i + 1;
            if(name.includes(dayValue)){
                if(checked){
                    daysChecked.current = [...daysChecked.current, dayValue];
                } else {
                    daysChecked.current = daysChecked.current.filter(value => value != dayValue);
                }
            }
        }
    }

    const checkDietWindowTable = () => {

        if(dietWindowsRef.current.length > 0){
            dietWindowTableRef.current.classList.remove('hidden');
        } else {
            dietWindowTableRef.current.classList.add('hidden');
        }
    }

    const handleChange = (event) => {

        const { name, type, checked, value } = event.target;

        let updatedValue = type === 'checkbox' ? checked : value;
        let updatedFormData = {
            ...formData,
            [name]: updatedValue
        };

        // add checked days to list
        addDays(name, checked);

        updatedFormData = validate(updatedFormData);
        if(getPercentFieldNames().includes(event.target.name))
            updatedFormData = handlePercentages(event.target.name, updatedFormData);

        // show weekday selection if every_day is not checked
        if(name == 'every_day'){

            if(!checked) {
                weekDaySelectionRef.current.classList.remove('hidden');
            }
            else {
                weekDaySelectionRef.current.classList.add('hidden');
                daysChecked.current.forEach(day => {
                    updatedFormData["day_"+day] = false;
                });
                daysChecked.current = [];
            }
        } 
        setFormData(updatedFormData);
    };

    const submitForm = async (event) => {
        event.preventDefault();
        const requestBody = {
            // ...other data fields you want to include,
            name: formData.name,
            description: formData.description,
            max_calories: formData.max_calories,
            min_calories: formData.min_calories,
            protein_max: formData.protein_max,
            fat_max: formData.fat_max,
            carb_max: formData.carb_max,
            dietWindows: dietWindowsRef.current,
            _token: document.querySelector('meta[name="csrf-token"]').getAttribute('content')

        };
    
        try {
            const response = await fetch('/diet/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
    
            if (response.ok) {
                const jsonResponse = await response.json();
                console.log('Form submitted successfully:', jsonResponse);
            } else {
                console.error('Failed to submit form:', response.status);
            }
        } catch (error) {
            console.error('There was an error submitting the form:', error);
        }
    };
    

    return (
        <div className="w-full max-w-md mx-auto mt-10">
            <div>{ diet != null ? "Edit" : "Create"} Diet</div>
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Name
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Description
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="description"
                        name="description"
                        type="text"
                        value={formData.description}
                        onChange={handleChange}
                    />
                    {errors.description && <p className="text-red-500 text-xs italic">{errors.description}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Max Daily Calories (optional)
                    </label>
                    <div class="flex justify-start">
                        <input
                            className="mr-5 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="calorie_max"
                            name="calorie_max"
                            type="number"
                            value={formData.calorie_max}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.calorie_max && <p className="text-red-500 text-xs italic">{errors.calorie_max}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Min Daily Calories (optional)
                    </label>
                    <div class="flex justify-start">
                        <input
                            className="mr-5 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="calorie_min"
                            name="calorie_min"
                            type="number"
                            value={formData.calorie_min}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.calorie_min && <p className="text-red-500 text-xs italic">{errors.calorie_min}</p>}
                </div>

                <div className="mb-4">
                    Diet Window
                    <hr class="mb-4" />
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_time">
                        Start Time
                    </label>
                    <div class="flex justify-start">
                        <input
                            ref={startTime}
                            className="mr-5 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="start_time"
                            name="start_time"
                            type="time"
                            value={formData.start_time}
                            onChange={handleChange}
                        />
                    </div>
                    {windowErrors.start_time && <p className="text-red-500 text-xs italic">{windowErrors.start_time}</p>}

                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_time">
                        End Time
                    </label>
                    <div class="flex justify-start">
                        <input
                            ref={endTime}
                            className="mr-5 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="end_time"
                            name="end_time"
                            type="time"
                            value={formData.end_time}
                            onChange={handleChange}
                        />
                    </div>
                    {windowErrors.end_time && <p className="text-red-500 text-xs italic">{windowErrors.end_time}</p>}

                    <div class="flex justify-start mt-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_time">
                            Every day?
                        </label>
                        <input
                            className="ml-5 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="every_day"
                            name="every_day"
                            type="checkbox"
                            checked={formData.every_day}
                            onChange={handleChange}
                        />
                    </div>

                    <div ref={weekDaySelectionRef} className="flex hidden my-4 justify-start mt-2">
                        <div className="mt-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Select Days:</label>

                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                                <div key={index} className="flex items-center">
                                    <input
                                        className="ml-5 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id={`day_${index + 1}`}
                                        name={`day_${index + 1}`}
                                        type="checkbox"
                                        checked={formData[`day_${index + 1}`] || false}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor={`day_${index + 1}`} className="ml-2 text-gray-700 text-sm">{day}</label>
                                </div>
                            ))}
                        </div>

                    </div>

                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                        onClick={addWindow}>
                        Add Window
                    </button>

                    <div ref={dietWindowTableRef} class="my-4 hidden">
                        <div class="flex text-left border-b-2 bg-gray-100 justify-around">
                            <div class="w-1/3">Start</div>
                            <div class="w-1/3">End</div>
                            <div class="w-1/3">Day</div>
                        </div>
                        {dietWindowsRef.current.map(window => (

                            <div onClick={() => toggleWindowModal(window.id)}
                                key={window.id} class="flex text-left hover:bg-gray-300 border-solid border-b-2 justify-around">
                                <div class="w-1/3 py-2">{window.start_time}</div>
                                <div class="w-1/3 py-2">{window.end_time}</div>
                                <div class="w-1/3 py-2">{window.day ? dayValueToString(window.day) : "Everyday"}</div>
                            </div>

                        ))}
                    </div>

                    <hr class="mt-4" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Max Protein Intake (Percentage)
                    </label>
                    <div class="flex justify-start">
                        <input
                            className="mr-5 shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="protein_max"
                            name="protein_max"
                            type="number"
                            value={formData.protein_max}
                            onChange={handleChange}
                        /> %
                    </div>
                    {errors.protein_max && <p className="text-red-500 text-xs italic">{errors.protein_max}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Max Fat Intake (Percentage)
                    </label>
                    <div class="flex justify-start">
                        <input
                            className="mr-5 shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="fat_max"
                            name="fat_max"
                            type="number"
                            value={formData.fat_max}
                            onChange={handleChange}
                        /> %
                    </div>
                    {errors.fat_max && <p className="text-red-500 text-xs italic">{errors.fat_max}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Max Carb Intake (Percentage)
                    </label>
                    <div class="flex justify-start">
                        <input
                            className="mr-5 shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="carb_max"
                            name="carb_max"
                            type="number"
                            value={formData.carb_max}
                            onChange={handleChange}
                        /> %
                    </div>
                    {errors.carb_max && <p className="text-red-500 text-xs italic">{errors.carb_max}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <button
                        onClick={submitForm}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        { diet != null ? "Edit" : "Create"} Diet
                    </button>
                </div>
            </form>

            <Modal show={windowModal} onClose={() => toggleWindowModal()} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Delete Diet Window?</h2>
                    <p>Are yous sure you want to delete this diet window?</p>
                    <div class="flex justify-around">
                        <button onClick={() => toggleWindowModal()} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                        <button onClick={removeWindow} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
