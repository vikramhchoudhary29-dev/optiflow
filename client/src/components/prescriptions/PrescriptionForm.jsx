import { useEffect, useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

import { getCustomers } from "../../services/customer.service";

export default function PrescriptionForm({
  initialData = null,
  onSubmit,
  onCancel,
}) {
  const [customers, setCustomers] = useState([]);

  const [form, setForm] = useState({
    customerId: "",

    rightSph: "",
    rightCyl: "",
    rightAxis: "",
    rightAdd: "",

    leftSph: "",
    leftCyl: "",
    leftAxis: "",
    leftAdd: "",

    pdDistance: "",
    pdNear: "",

    lensType: "",
    lens: "",
    frame: "",

    contactLensBrand: "",
    contactLensType: "",

    rightBc: "",
    rightDia: "",
    rightPower: "",

    leftBc: "",
    leftDia: "",
    leftPower: "",

    doctorName: "",
    doctorNotes: "",

    expiryDate: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        customerId: initialData.customerId,

        expiryDate: initialData.expiryDate
          ? initialData.expiryDate.substring(0, 10)
          : "",
      });
    }
  }, [initialData]);

  async function loadCustomers() {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  function change(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function submit(e) {
    e.preventDefault();

    onSubmit({
      ...form,
      customerId: Number(form.customerId),

      rightSph: form.rightSph === "" ? undefined : Number(form.rightSph),
      rightCyl: form.rightCyl === "" ? undefined : Number(form.rightCyl),
      rightAxis: form.rightAxis === "" ? undefined : Number(form.rightAxis),
      rightAdd: form.rightAdd === "" ? undefined : Number(form.rightAdd),

      leftSph: form.leftSph === "" ? undefined : Number(form.leftSph),
      leftCyl: form.leftCyl === "" ? undefined : Number(form.leftCyl),
      leftAxis: form.leftAxis === "" ? undefined : Number(form.leftAxis),
      leftAdd: form.leftAdd === "" ? undefined : Number(form.leftAdd),

      pdDistance:
        form.pdDistance === ""
          ? undefined
          : Number(form.pdDistance),

      pdNear:
        form.pdNear === ""
          ? undefined
          : Number(form.pdNear),

      rightBc:
        form.rightBc === ""
          ? undefined
          : Number(form.rightBc),

      rightDia:
        form.rightDia === ""
          ? undefined
          : Number(form.rightDia),

      rightPower:
        form.rightPower === ""
          ? undefined
          : Number(form.rightPower),

      leftBc:
        form.leftBc === ""
          ? undefined
          : Number(form.leftBc),

      leftDia:
        form.leftDia === ""
          ? undefined
          : Number(form.leftDia),

      leftPower:
        form.leftPower === ""
          ? undefined
          : Number(form.leftPower),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8">

      {/* Customer */}

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className="block mb-2 font-medium">
            Customer
          </label>

          <select
            name="customerId"
            value={form.customerId}
            onChange={change}
            required
            className="w-full border rounded-lg p-3"
          >
            <option value="">
              Select Customer
            </option>

            {customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.customerCode} - {customer.name}
              </option>
            ))}

          </select>

        </div>

        <Input
          label="Doctor Name"
          name="doctorName"
          value={form.doctorName}
          onChange={change}
        />

      </div>

      {/* Distance Vision */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          Distance Vision
        </h2>

        <div className="grid grid-cols-4 gap-4">

          <Input
            label="Right SPH"
            name="rightSph"
            value={form.rightSph}
            onChange={change}
          />

          <Input
            label="Right CYL"
            name="rightCyl"
            value={form.rightCyl}
            onChange={change}
          />

          <Input
            label="Right Axis"
            name="rightAxis"
            value={form.rightAxis}
            onChange={change}
          />

          <Input
            label="Right ADD"
            name="rightAdd"
            value={form.rightAdd}
            onChange={change}
          />

          <Input
            label="Left SPH"
            name="leftSph"
            value={form.leftSph}
            onChange={change}
          />

          <Input
            label="Left CYL"
            name="leftCyl"
            value={form.leftCyl}
            onChange={change}
          />

          <Input
            label="Left Axis"
            name="leftAxis"
            value={form.leftAxis}
            onChange={change}
          />

          <Input
            label="Left ADD"
            name="leftAdd"
            value={form.leftAdd}
            onChange={change}
          />

        </div>

      </div>

      {/* PD */}

      <div className="grid grid-cols-2 gap-4">

        <Input
          label="PD Distance"
          name="pdDistance"
          value={form.pdDistance}
          onChange={change}
        />

        <Input
          label="PD Near"
          name="pdNear"
          value={form.pdNear}
          onChange={change}
        />

      </div>

      {/* Lens */}

      <div className="grid grid-cols-2 gap-4">

        <Input
          label="Lens Type"
          name="lensType"
          value={form.lensType}
          onChange={change}
        />

        <Input
          label="Lens"
          name="lens"
          value={form.lens}
          onChange={change}
        />

      </div>

      {/* Frame */}

      <Input
        label="Frame"
        name="frame"
        value={form.frame}
        onChange={change}
      />

      {/* Contact Lens */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          Contact Lens
        </h2>

        <div className="grid grid-cols-4 gap-4">

          <Input
            label="Brand"
            name="contactLensBrand"
            value={form.contactLensBrand}
            onChange={change}
          />

          <Input
            label="Type"
            name="contactLensType"
            value={form.contactLensType}
            onChange={change}
          />

          <Input
            label="Right BC"
            name="rightBc"
            value={form.rightBc}
            onChange={change}
          />

          <Input
            label="Right DIA"
            name="rightDia"
            value={form.rightDia}
            onChange={change}
          />

          <Input
            label="Right Power"
            name="rightPower"
            value={form.rightPower}
            onChange={change}
          />

          <Input
            label="Left BC"
            name="leftBc"
            value={form.leftBc}
            onChange={change}
          />

          <Input
            label="Left DIA"
            name="leftDia"
            value={form.leftDia}
            onChange={change}
          />

          <Input
            label="Left Power"
            name="leftPower"
            value={form.leftPower}
            onChange={change}
          />

        </div>

      </div>

      {/* Footer */}

      <div className="grid grid-cols-2 gap-4">

        <Input
          type="date"
          label="Expiry Date"
          name="expiryDate"
          value={form.expiryDate}
          onChange={change}
        />

      </div>

      <Textarea
        label="Doctor Notes"
        name="doctorNotes"
        rows={4}
        value={form.doctorNotes}
        onChange={change}
      />

      <div className="flex justify-end gap-3 border-t pt-6">

        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
        >
          Save Prescription
        </Button>

      </div>

    </form>
  );
}