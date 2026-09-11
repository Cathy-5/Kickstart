import { useState } from "react";

export default function ReflectionForm ({onSave}) {   
    const [reflection, setReflection] = useState("");   

    function handleSubmit(event) {
        event.preventDefault();
        onSave(reflection);
    }

    return (
        <form onSubmit={handleSubmit}>
            <label> How did that feel? 
                <input
                   value={reflection}
                   onChange={(event) => 
                    setReflection(event.target.value)}
                />
            </label>
            <button type="submit">Save reflection</button>
        </form>
    );

}