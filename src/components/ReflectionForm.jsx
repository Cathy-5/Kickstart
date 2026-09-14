import { useState } from "react";

export default function ReflectionForm ({onSave, onSkip}) {
    const [reflection, setReflection] = useState("");   

    function handleSubmit(event) {
        event.preventDefault();
        onSave(reflection);
    }

    return (
        <form className="reflection-form" onSubmit={handleSubmit}>
            <label> A thought to keep? <span className="optional-label">Optional</span>
                <input
                   value={reflection}
                   onChange={(event) => 
                    setReflection(event.target.value)}
                />
            </label>
            <div className="reflection-actions">
                <button type="submit">Save &amp; return</button>
                <button type="button" className="text-button" onClick={onSkip}>Skip</button>
            </div>
        </form>
    );

}
