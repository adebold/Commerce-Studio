# Prompt Template for Development Tasks

This document provides a template for creating effective prompts when working with AI agents on development tasks for the EyewearML Platform.

## General Structure

A well-structured prompt typically includes:

1. **Context**: Background information about the task and relevant codebase
2. **Objective**: Clear statement of what you want to achieve
3. **Constraints**: Any limitations or requirements to consider
4. **Examples**: Sample code or output format (if applicable)
5. **Specific Questions**: Detailed questions or instructions

## Template

```
# Task: [Brief description of the task]

## Context
- [Project background relevant to the task]
- [Current state of the codebase]
- [Related files or components]

## Objective
[Clear statement of what you want to achieve]

## Requirements
- [Functional requirement 1]
- [Functional requirement 2]
- [Non-functional requirement 1]
- [Non-functional requirement 2]

## Constraints
- [Technical constraint 1]
- [Technical constraint 2]
- [Business constraint 1]
- [Business constraint 2]

## Relevant Code
[Include relevant code snippets or file paths]

## Expected Output
[Describe the expected output format or behavior]

## Specific Instructions
1. [Instruction 1]
2. [Instruction 2]
3. [Instruction 3]

## Questions
- [Specific question 1]
- [Specific question 2]
```

## Example Prompts

### Feature Implementation

```
# Task: Implement Patient Search Functionality

## Context
- We're building an optometry practice analytics platform with patient management features
- The backend is built with FastAPI and SQLAlchemy
- We need to implement a search functionality for patients
- Patient data includes PHI and must be handled securely

## Objective
Implement a search endpoint that allows users to search for patients by name, email, or phone number.

## Requirements
- Search should be case-insensitive
- Search should support partial matches
- Results should be paginated
- Results should be sorted by last name, then first name
- PHI must remain encrypted at rest

## Constraints
- Must follow HIPAA compliance guidelines
- Must use existing encryption/decryption utilities
- Must include proper authentication checks

## Relevant Code
Patient model:
```python
class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    _first_name = Column("first_name", String, nullable=False)
    _last_name = Column("last_name", String, nullable=False)
    _email = Column("email", String, nullable=True)
    _phone = Column("phone", String, nullable=True)
    # ... other fields ...

    @property
    def first_name(self) -> str:
        return decrypt_phi(self._first_name)
    
    @first_name.setter
    def first_name(self, value: str) -> None:
        self._first_name = encrypt_phi(value)
    
    # ... other getters/setters ...
```

## Expected Output
1. A search endpoint in the patients router
2. A search method in the patient service
3. A search schema for request validation
4. Unit tests for the search functionality

## Specific Instructions
1. Create a search schema in schemas/patient.py
2. Implement a search method in services/patient_service.py
3. Add a search endpoint in api/patients/router.py
4. Write unit tests for the search functionality

## Questions
- What's the most efficient way to search encrypted fields?
- How should we handle pagination with encrypted fields?
- Are there any security concerns with the search functionality?
```

### Code Review

```
# Task: Review Patient Model Implementation

## Context
- We're building an optometry practice analytics platform with patient management features
- The backend is built with FastAPI and SQLAlchemy
- We've implemented a Patient model with encrypted PHI fields
- We need to ensure the implementation is secure and follows best practices

## Objective
Review the Patient model implementation for security, performance, and adherence to best practices.

## Relevant Code
```python
class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Non-PHI fields (not encrypted)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # PHI fields (encrypted)
    _first_name = Column("first_name", String, nullable=False)
    _last_name = Column("last_name", String, nullable=False)
    _date_of_birth = Column("date_of_birth", String, nullable=False)
    _email = Column("email", String, nullable=True)
    _phone = Column("phone", String, nullable=True)
    _address = Column("address", String, nullable=True)
    _city = Column("city", String, nullable=True)
    _state = Column("state", String, nullable=True)
    _zip_code = Column("zip_code", String, nullable=True)
    _insurance_provider = Column("insurance_provider", String, nullable=True)
    _insurance_id = Column("insurance_id", String, nullable=True)
    
    # Relationships
    appointments = relationship("Appointment", back_populates="patient")
    
    def __repr__(self) -> str:
        return f"<Patient {self.id}>"
    
    # Property getters and setters for encrypted fields
    
    @property
    def first_name(self) -> str:
        return decrypt_phi(self._first_name)
    
    @first_name.setter
    def first_name(self, value: str) -> None:
        self._first_name = encrypt_phi(value)
    
    # ... other getters/setters ...
    
    @property
    def full_name(self) -> str:
        """
        Return the patient's full name.
        """
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> int:
        """
        Calculate the patient's age.
        """
        today = date.today()
        dob = self.date_of_birth
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return age
    
    @classmethod
    def create(cls, first_name: str, last_name: str, date_of_birth: date, 
               email: Optional[str] = None, phone: Optional[str] = None,
               address: Optional[str] = None, city: Optional[str] = None,
               state: Optional[str] = None, zip_code: Optional[str] = None,
               insurance_provider: Optional[str] = None, 
               insurance_id: Optional[str] = None) -> "Patient":
        """
        Create a new patient with encrypted PHI.
        """
        patient = cls()
        patient.first_name = first_name
        patient.last_name = last_name
        patient.date_of_birth = date_of_birth
        patient.email = email
        patient.phone = phone
        patient.address = address
        patient.city = city
        patient.state = state
        patient.zip_code = zip_code
        patient.insurance_provider = insurance_provider
        patient.insurance_id = insurance_id
        return patient
```

## Specific Questions
1. Is the encryption approach secure and following best practices?
2. Are there any performance concerns with the current implementation?
3. Are there any security vulnerabilities in the code?
4. Are there any improvements we could make to the model?
5. Is the handling of nullable fields appropriate?
6. Are there any issues with the relationships?
7. Is the create method implemented correctly?
```

### Bug Fix

```
# Task: Fix Patient Search Performance Issue

## Context
- We're experiencing slow performance with the patient search functionality
- The search is currently performed on encrypted fields, which requires decrypting all records
- We have approximately 10,000 patient records in the database
- The current implementation is causing timeouts for users

## Objective
Improve the performance of the patient search functionality without compromising security.

## Current Implementation
```python
async def search(self, query: str, limit: int = 10, offset: int = 0) -> List[Patient]:
    """
    Search for patients.
    """
    # Get all patients
    all_patients_query = select(Patient)
    result = await self.db.execute(all_patients_query)
    all_patients = result.scalars().all()
    
    # Filter patients by decrypting and checking fields
    filtered_patients = []
    for patient in all_patients:
        if (query.lower() in patient.first_name.lower() or
            query.lower() in patient.last_name.lower() or
            (patient.email and query.lower() in patient.email.lower()) or
            (patient.phone and query.lower() in patient.phone.lower())):
            filtered_patients.append(patient)
    
    # Apply pagination
    paginated_patients = filtered_patients[offset:offset+limit]
    
    return paginated_patients
```

## Constraints
- Must maintain HIPAA compliance
- Must keep PHI encrypted at rest
- Must work with the existing database schema

## Expected Output
An improved implementation of the search method that performs better while maintaining security.

## Specific Questions
1. What approaches can we use to improve search performance with encrypted fields?
2. Would adding indexes help in this case? If so, how?
3. Are there any database-level optimizations we could make?
4. Could we use a different search algorithm or data structure?
```

## Tips for Effective Prompts

1. **Be Specific**: Clearly define what you want the agent to do.
2. **Provide Context**: Include relevant code snippets, error messages, and requirements.
3. **Set Constraints**: Specify any limitations or requirements the solution must adhere to.
4. **Use Examples**: Provide examples of the desired output when possible.
5. **Break Down Complex Tasks**: For complex tasks, break them down into smaller, more manageable prompts.
6. **Iterative Refinement**: Start with a high-level request and refine based on the agent's response.
7. **Ask for Explanations**: Request explanations for the proposed solutions to ensure understanding.
8. **Specify Format**: Indicate the desired format for the response (e.g., code snippets, bullet points, etc.).

## Common Pitfalls to Avoid

1. **Vague Requests**: Avoid vague or ambiguous requests that can lead to misunderstandings.
2. **Insufficient Context**: Provide enough context for the agent to understand the task.
3. **Overloading**: Avoid asking too many questions or requesting too many tasks in a single prompt.
4. **Assuming Knowledge**: Don't assume the agent has knowledge of your specific codebase without providing context.
5. **Ignoring Constraints**: Clearly specify any constraints or requirements the solution must adhere to.
6. **Not Reviewing**: Always review and understand the agent's response before implementing it.
