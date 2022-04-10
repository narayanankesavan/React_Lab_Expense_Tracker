import { useState, useEffect, useRef, FormEvent } from "react";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import IItem from "../models/IItem";
import { getItems, postItem } from "../services/items";

const ExpenseTracker = () => {
    const [items, setItems] = useState<IItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const payeeNameRef = useRef<HTMLSelectElement | null>( null );
    const priceRef = useRef<HTMLInputElement | null>( null );
    const productRef = useRef<HTMLInputElement | null>( null );
    const dateRef = useRef<HTMLInputElement | null>( null );

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const addItem = async () => {
        const item = {
            payeeName: payeeNameRef.current?.value || '',
            price: parseInt( priceRef.current?.value || '0' ),
            product: productRef.current?.value || '',
            setDate: dateRef.current?.value ||(new Date()).toISOString().substr( 0, 10 )
        };

        const newItem = await postItem( item );

        setItems(
            [
                ...items,
                newItem
            ]
        );
        
        setShow( false );
    }

    const fetchItems = async () => {
        setLoading(true);
        const items = await getItems();
        setItems(items);
        setLoading(false);
    };

    const personalExpense = (payeeName: string) => {
        return items
            .filter((i) => i.payeeName === payeeName) // only items paid for by payeeName
            .reduce((acc, i) => acc + i.price, 0); // total of all items
    };

    const getPayable = () => {
        const rahulPaid = personalExpense("Rahul");
        const rameshPaid = personalExpense("Ramesh");

        return {
            payable: Math.abs(rahulPaid - rameshPaid) / 2,
            message:
                rahulPaid < rameshPaid
                    ? "Rahul has to pay"
                    : "Ramesh has to pay",
        };
    };
    const getTotal = () => {
        const rahulPaid = personalExpense("Rahul");
        const rameshPaid = personalExpense("Ramesh");
        return {
            payable: Math.abs(rahulPaid + rameshPaid) 
        };
    };

    useEffect(
        () => {
            fetchItems();
        },
        [] // effect function to run only on component load
    );

    const [validated, setValidated] = useState(false);


    const handleSubmit = async (event : FormEvent<HTMLFormElement>) =>{
      const form = event.currentTarget;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }
  
      setValidated(true);
    };

    

    

    return (
        <Container className="my-4">
            <h1 >
                Expense Tracker
                <Button variant="primary float-end" onClick={handleShow}>
                    Add an item
                </Button>
            </h1>

            <Modal show={show} onHide={handleClose} >
                <Modal.Header closeButton>
                    <Modal.Title>Add an item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit} > 
                        <Form.Group className="mb-3" controlId="payeeName">
                            <Form.Label>Who paid?</Form.Label>
                            <Form.Select aria-label="Default select example" ref={payeeNameRef} required>
                                <option value="">Select one</option>
                                <option value="Rahul">Rahul</option>
                                <option value="Ramesh">Ramesh</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please select a valid payee.
                            </Form.Control.Feedback>

                        </Form.Group>

                        <Form.Group
                            className="mb-3"
                            controlId="price"
                        >
                            <Form.Label>Expense amount</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="How much was spent? (Rs.)"
                                ref={priceRef}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter amount.
                            </Form.Control.Feedback>

                        </Form.Group>
                        
                        <Form.Group
                            className="mb-3"
                            controlId="product"
                        >
                            <Form.Label>Describe the expense</Form.Label>
                            <Form.Control
                                placeholder="Product Details"
                                ref={productRef}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="date">
                            <Form.Label>Select Date</Form.Label>
                            <Form.Control type="date" name="date" placeholder="Date of Birth" ref={dateRef} required />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" className="needs-validation" onClick={addItem}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <hr />

            <Table striped bordered hover size="sm">
                <thead>
                    <tr className="bg-warning">
                        <th>Payee</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Expense</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        /* Exercise: Go through items and display a row for every expense item */
                        /* make sure to set key */
                        items.map((item) => (
                            <tr key={item.id} className={
                                item.payeeName === "Rahul"
                                    ? "bg-success"
                                    : "bg-info"
                            }>
                                <td>
                                    {item.payeeName}
                                </td>
                                <td>{item.setDate}</td>
                                <td>{item.product}</td>
                                <td className="text-end font-monospace">
                                    {item.price}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
                <tfoot>
                    <tr className="bg-primary">
                        <td colSpan={3} className="text-end">
                            Total
                        </td>
                        <td className="text-end">
                            {getTotal().payable}
                        </td>

                    </tr>
                    <tr className="bg-success">
                        <td colSpan={3} className="text-end">
                            Total amount spent by Rahul
                        </td>
                        <td className="text-end font-monospace">
                            {personalExpense("Rahul")}
                        </td>
                    </tr>
                    <tr className="bg-info">
                        <td colSpan={3} className="text-end">
                            Total amount spent by Ramesh
                        </td>
                        <td className="text-end font-monospace">
                            {personalExpense("Ramesh")}
                        </td>
                    </tr>
                    <tr className="bg-warning">
                        <td colSpan={3} className="text-end">
                            {getPayable().message}
                        </td>
                        <td className="text-end font-monospace">
                            {getPayable().payable}
                        </td>
                    </tr>
                </tfoot>
            </Table>
        </Container>
    );
};

export default ExpenseTracker;