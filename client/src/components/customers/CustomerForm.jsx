import { useState, useEffect } from "react";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";

export default function CustomerForm({
  initialData = null,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    gender: "MALE",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    remarks: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        dob: initialData.dob
          ? initialData.dob.substring(0, 10)
          : "",
      });
    }
  }, [initialData]);

  const change = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-5"
    >
      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Customer Name"
          name="name"
          value={form.name}
          onChange={change}
          required
        />

        <Input
          label="Mobile"
          name="mobile"
          value={form.mobile}
          onChange={change}
          required
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email"
          name="email"
          value={form.email}
          onChange={change}
        />

        <Select
          label="Gender"
          name="gender"
          value={form.gender}
          onChange={change}
        >
          <option value="MALE">
            Male
          </option>

          <option value="FEMALE">
            Female
          </option>

          <option value="OTHER">
            Other
          </option>
        </Select>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          name="dob"
          value={form.dob}
          onChange={change}
        />

        <Input
          label="Pincode"
          name="pincode"
          value={form.pincode}
          onChange={change}
        />
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={change}
        />

        <Input
          label="State"
          name="state"
          value={form.state}
          onChange={change}
        />
      </div>

      {/* Address */}
      <Textarea
        label="Address"
        name="address"
        rows={3}
        value={form.address}
        onChange={change}
      />

      {/* Remarks */}
      <Textarea
        label="Remarks"
        name="remarks"
        rows={2}
        value={form.remarks}
        onChange={change}
      />

      <div className="flex justify-end gap-3 border-t pt-5">
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
          Save Customer
        </Button>
      </div>
    </form>
  );
}