"""
Tests for the Custom CSV/XML integration.
"""

import os
import pytest
import tempfile
import csv
import xml.etree.ElementTree as ET
from unittest.mock import patch, MagicMock, AsyncMock

from src.integrations.pms_ehr.base import (
    IntegrationCapability,
    IntegrationStandard,
    IntegrationError
)
from src.integrations.pms_ehr.custom_csv_xml import (
    FileFormat,
    CustomCSVXMLIntegration,
    CustomCSVXMLPatientIntegration
)


class TestCustomCSVXMLIntegration:
    """Tests for the Custom CSV/XML integration."""
    
    @pytest.fixture
    def temp_dirs(self):
        """Create temporary directories for import/export."""
        with tempfile.TemporaryDirectory() as import_dir, tempfile.TemporaryDirectory() as export_dir:
            yield import_dir, export_dir
    
    @pytest.fixture
    def csv_integration(self, temp_dirs):
        """Create a CSV integration for testing."""
        import_dir, export_dir = temp_dirs
        return CustomCSVXMLIntegration(
            provider_name="test_provider",
            base_url="",
            auth_config={},
            capabilities=[IntegrationCapability.PATIENT_DATA],
            file_format=FileFormat.CSV,
            import_directory=import_dir,
            export_directory=export_dir
        )
    
    @pytest.fixture
    def xml_integration(self, temp_dirs):
        """Create an XML integration for testing."""
        import_dir, export_dir = temp_dirs
        return CustomCSVXMLIntegration(
            provider_name="test_provider",
            base_url="",
            auth_config={},
            capabilities=[IntegrationCapability.PATIENT_DATA],
            file_format=FileFormat.XML,
            import_directory=import_dir,
            export_directory=export_dir
        )
    
    @pytest.mark.asyncio
    async def test_init(self, csv_integration, temp_dirs):
        """Test initialization of Custom CSV/XML integration."""
        import_dir, export_dir = temp_dirs
        assert csv_integration.provider_name == "test_provider"
        assert csv_integration.base_url == ""
        assert csv_integration.auth_config == {}
        assert csv_integration.standard == IntegrationStandard.CUSTOM_CSV_XML
        assert IntegrationCapability.PATIENT_DATA in csv_integration.capabilities
        assert csv_integration.file_format == FileFormat.CSV
        assert csv_integration.import_directory == import_dir
        assert csv_integration.export_directory == export_dir
    
    @pytest.mark.asyncio
    async def test_authenticate(self, csv_integration):
        """Test authentication."""
        result = await csv_integration.authenticate()
        assert result is True
        assert csv_integration._authenticated is True
    
    @pytest.mark.asyncio
    async def test_test_connection(self, csv_integration):
        """Test connection testing."""
        result = await csv_integration.test_connection()
        assert result is True
    
    @pytest.mark.asyncio
    async def test_import_export_csv(self, csv_integration, temp_dirs):
        """Test importing and exporting CSV files."""
        import_dir, _ = temp_dirs
        
        # Create a test CSV file
        test_data = [
            {"id": "1", "name": "John Doe", "age": "30"},
            {"id": "2", "name": "Jane Smith", "age": "25"}
        ]
        
        test_file = os.path.join(import_dir, "test.csv")
        with open(test_file, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["id", "name", "age"])
            writer.writeheader()
            writer.writerows(test_data)
        
        # Import the file
        imported_data = await csv_integration._import_file("test.csv")
        assert imported_data == test_data
        
        # Export the data
        exported_file = await csv_integration._export_file("test_export.csv", test_data)
        assert os.path.exists(exported_file)
        
        # Import the exported file to verify
        imported_export = await csv_integration._import_file("test_export.csv")
        assert imported_export == test_data
    
    @pytest.mark.asyncio
    async def test_import_export_xml(self, xml_integration, temp_dirs):
        """Test importing and exporting XML files."""
        import_dir, _ = temp_dirs
        
        # Create a test XML file
        root = ET.Element("root")
        patients = ET.SubElement(root, "patients")
        
        patient1 = ET.SubElement(patients, "patient")
        patient1.set("id", "1")
        name1 = ET.SubElement(patient1, "name")
        name1.text = "John Doe"
        age1 = ET.SubElement(patient1, "age")
        age1.text = "30"
        
        patient2 = ET.SubElement(patients, "patient")
        patient2.set("id", "2")
        name2 = ET.SubElement(patient2, "name")
        name2.text = "Jane Smith"
        age2 = ET.SubElement(patient2, "age")
        age2.text = "25"
        
        tree = ET.ElementTree(root)
        test_file = os.path.join(import_dir, "test.xml")
        tree.write(test_file)
        
        # Import the file
        imported_data = await xml_integration._import_file("test.xml")
        assert "patients" in imported_data
        assert "patient" in imported_data["patients"]
        
        patients = imported_data["patients"]["patient"]
        if not isinstance(patients, list):
            patients = [patients]
        
        assert len(patients) == 2
        assert patients[0]["@id"] == "1"
        assert patients[0]["name"] == "John Doe"
        assert patients[0]["age"] == "30"
        assert patients[1]["@id"] == "2"
        assert patients[1]["name"] == "Jane Smith"
        assert patients[1]["age"] == "25"
        
        # Export the data
        exported_file = await xml_integration._export_file("test_export.xml", imported_data, "root")
        assert os.path.exists(exported_file)
        
        # Import the exported file to verify
        imported_export = await xml_integration._import_file("test_export.xml")
        assert "patients" in imported_export
        assert "patient" in imported_export["patients"]
    
    @pytest.mark.asyncio
    async def test_import_nonexistent_file(self, csv_integration):
        """Test importing a non-existent file."""
        with pytest.raises(IntegrationError):
            await csv_integration._import_file("nonexistent.csv")
    
    @pytest.mark.asyncio
    async def test_list_import_files(self, csv_integration, temp_dirs):
        """Test listing import files."""
        import_dir, _ = temp_dirs
        
        # Create some test files
        open(os.path.join(import_dir, "test1.csv"), "w").close()
        open(os.path.join(import_dir, "test2.csv"), "w").close()
        open(os.path.join(import_dir, "test.txt"), "w").close()
        
        # List all files
        files = await csv_integration._list_import_files()
        assert len(files) == 3
        assert "test1.csv" in files
        assert "test2.csv" in files
        assert "test.txt" in files
        
        # List only CSV files
        csv_files = await csv_integration._list_import_files("*.csv")
        assert len(csv_files) == 2
        assert "test1.csv" in csv_files
        assert "test2.csv" in csv_files
        assert "test.txt" not in csv_files


class TestCustomCSVXMLPatientIntegration:
    """Tests for the Custom CSV/XML patient integration."""
    
    @pytest.fixture
    def temp_dirs(self):
        """Create temporary directories for import/export."""
        with tempfile.TemporaryDirectory() as import_dir, tempfile.TemporaryDirectory() as export_dir:
            yield import_dir, export_dir
    
    @pytest.fixture
    def csv_patient_integration(self, temp_dirs):
        """Create a CSV patient integration for testing."""
        import_dir, export_dir = temp_dirs
        return CustomCSVXMLPatientIntegration(
            provider_name="test_provider",
            base_url="",
            auth_config={},
            capabilities=[IntegrationCapability.PATIENT_DATA],
            file_format=FileFormat.CSV,
            import_directory=import_dir,
            export_directory=export_dir
        )
    
    @pytest.mark.asyncio
    async def test_create_get_patient(self, csv_patient_integration, temp_dirs):
        """Test creating and getting a patient."""
        # Create a patient
        patient_data = {
            "id": "test_id",
            "name": "John Doe",
            "gender": "male",
            "birthDate": "1970-01-01"
        }
        
        patient_id = await csv_patient_integration.create_patient(patient_data)
        assert patient_id == "test_id"
        
        # Get the patient
        patient = await csv_patient_integration.get_patient("test_id")
        assert patient["id"] == "test_id"
        assert patient["name"] == "John Doe"
        assert patient["gender"] == "male"
        assert patient["birthDate"] == "1970-01-01"
    
    @pytest.mark.asyncio
    async def test_search_patients(self, csv_patient_integration, temp_dirs):
        """Test searching for patients."""
        # Create some patients
        patients = [
            {
                "id": "1",
                "name": "John Doe",
                "gender": "male",
                "birthDate": "1970-01-01"
            },
            {
                "id": "2",
                "name": "Jane Smith",
                "gender": "female",
                "birthDate": "1980-01-01"
            },
            {
                "id": "3",
                "name": "Bob Johnson",
                "gender": "male",
                "birthDate": "1990-01-01"
            }
        ]
        
        for patient in patients:
            await csv_patient_integration.create_patient(patient)
        
        # Search for male patients
        male_patients = await csv_patient_integration.search_patients({"gender": "male"})
        assert len(male_patients) == 2
        assert male_patients[0]["id"] in ["1", "3"]
        assert male_patients[1]["id"] in ["1", "3"]
        
        # Search for a specific patient
        john_doe = await csv_patient_integration.search_patients({"name": "John Doe"})
        assert len(john_doe) == 1
        assert john_doe[0]["id"] == "1"
    
    @pytest.mark.asyncio
    async def test_update_patient(self, csv_patient_integration, temp_dirs):
        """Test updating a patient."""
        # Create a patient
        patient_data = {
            "id": "test_id",
            "name": "John Doe",
            "gender": "male",
            "birthDate": "1970-01-01"
        }
        
        patient_id = await csv_patient_integration.create_patient(patient_data)
        
        # Update the patient
        updated_data = {
            "id": "test_id",
            "name": "John Q. Doe",
            "gender": "male",
            "birthDate": "1970-01-01",
            "address": "123 Main St"
        }
        
        updated = await csv_patient_integration.update_patient("test_id", updated_data)
        assert updated is True
        
        # Get the updated patient
        patient = await csv_patient_integration.get_patient("test_id")
        assert patient["id"] == "test_id"
        assert patient["name"] == "John Q. Doe"
        assert patient["address"] == "123 Main St"
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_patient(self, csv_patient_integration, temp_dirs):
        """Test getting a non-existent patient."""
        with pytest.raises(IntegrationError):
            await csv_patient_integration.get_patient("nonexistent")